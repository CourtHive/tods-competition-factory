import { allCompetitionMatchUps } from '../../../getters/matchUpsGetter';
import { getSchedulingProfile } from './schedulingProfile';

import { MISSING_TOURNAMENT_RECORDS } from '../../../../constants/errorConditionConstants';
import drawDefinitionConstants from '../../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import { definedAttributes } from '../../../../utilities/objects';

const { stageOrder } = drawDefinitionConstants;

export function getProfileRounds({ tournamentRecords }) {
  const { schedulingProfile, error } = getSchedulingProfile({
    tournamentRecords,
  });
  if (error) return { error };

  const profileRounds = schedulingProfile
    .map(({ venues }) =>
      venues.map(({ rounds }) => rounds.map((round) => getRef(round)))
    )
    .flat(Infinity);
  return { profileRounds };
}

function getRef(obj) {
  const {
    containerStructureId,
    segmentNumber,
    isRoundRobin,
    tournamentId,
    roundNumber,
    structureId,
    eventId,
    drawId,
  } = obj;
  const relevantStructureId = isRoundRobin ? containerStructureId : structureId;

  // retain order
  const ref = [
    tournamentId, // 1
    eventId, // 2
    drawId, // 3
    relevantStructureId, // 4
    roundNumber, // 5
  ].join('|');

  return definedAttributes({
    ref,
    segmentNumber,
    tournamentId,
    eventId,
    drawId,
    structureId: relevantStructureId,
    roundNumber,
  });
}

/*
export function roundIsScheduled({ matchUp, schedulingProfile }) {
  const ref = getRef(matchUp).ref;
  return !!schedulingProfile.find((profile) =>
    profile.venues.find((venue) =>
      venue.rounds.find((round) => {
        const roundRef = getRef(round).ref;
        if (roundRef === ref) {
          if (!round.roundSegment) return true;
        }
      })
    )
  );
}
*/

export function getRounds({ tournamentRecords }) {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const matchUps =
    allCompetitionMatchUps({ tournamentRecords })?.matchUps || [];

  const rounds = Object.values(
    matchUps.reduce((rounds, matchUp) => {
      const ref = getRef(matchUp).ref;
      const roundMatchUps = [...(rounds[ref]?.roundMatchUps ?? []), matchUp];
      const {
        containerStructureId,
        drawId,
        drawName,
        eventId,
        eventName,
        isRoundRobin,
        matchUpType,
        roundName,
        roundNumber,
        roundOffset,
        stageSequence,
        structureId,
        structureName,
        tournamentId,
      } = matchUp;
      const relevantStructureId = isRoundRobin
        ? containerStructureId
        : structureId;
      return {
        ...rounds,
        [ref]: {
          drawId,
          drawName,
          eventId,
          eventName,
          matchUpType,
          roundMatchUps,
          roundName,
          roundNumber,
          roundOffset,
          stageSequence,
          structureId: relevantStructureId,
          structureName,
          tournamentId,
        },
      };
    }, {})
  )
    .map((round) => {
      const matchUpsCount = round.roundMatchUps?.length ?? 0;
      const { minFinishingSum, winnerFinishingPositionRange } =
        getFinishingPositionDetails(round.roundMatchUps);
      return {
        ...round,
        winnerFinishingPositionRange,
        minFinishingSum,
        matchUpsCount,
      };
    })
    .sort(roundSort);

  return { ...SUCCESS, rounds };
}

// Sort rounds by order in which they will be played
function roundSort(a, b) {
  return (
    a.eventName.localeCompare(b.eventName) ||
    a.eventId.localeCompare(b.eventId) ||
    (stageOrder[a?.stage] || 0) - (stageOrder[b?.stage] || 0) ||
    b.matchUpsCount - a.matchUpsCount ||
    `${a.stageSequence}-${a.roundNumber}-${a.minFinishingSum}`.localeCompare(
      `${b.stageSequence}-${b.roundNumber}-${b.minFinishingSum}`
    )
  );
}

function getFinishingPositionDetails(matchUps) {
  return (matchUps || []).reduce(
    (foo, matchUp) => {
      const sum = (matchUp.finishingPositionRange?.winner || []).reduce(
        (a, b) => a + b,
        0
      );
      const winnerFinishingPositionRange = (
        matchUp.finishingPositionRange?.winner || ''
      ).join('-');
      return !foo.minFinishingSum || sum < foo.minFinishingSum
        ? { minFinishingSum: sum, winnerFinishingPositionRange }
        : foo;
    },
    { minFinishingSum: 0, winnerFinishingPositionRange: '' }
  );
}
