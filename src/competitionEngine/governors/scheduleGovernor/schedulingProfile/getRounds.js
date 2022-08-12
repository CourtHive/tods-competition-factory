import { validateSchedulingProfile } from '../../../../global/validation/validateSchedulingProfile';
import { allCompetitionMatchUps } from '../../../getters/matchUpsGetter';
import { definedAttributes } from '../../../../utilities/objects';
import { getSchedulingProfile } from './schedulingProfile';

import drawDefinitionConstants from '../../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORDS,
  NOT_FOUND,
} from '../../../../constants/errorConditionConstants';
import { chunkArray } from '../../../../utilities';
import { completedMatchUpStatuses } from '../../../../constants/matchUpStatusConstants';

const { stageOrder } = drawDefinitionConstants;

export function getProfileRounds({ tournamentRecords, schedulingProfile }) {
  if (schedulingProfile) {
    const profileValidity = validateSchedulingProfile({
      tournamentRecords,
      schedulingProfile,
    });

    if (profileValidity.error) return profileValidity;
  }

  if (!schedulingProfile) {
    const result = getSchedulingProfile({ tournamentRecords });
    if (result.error) return result;
    schedulingProfile = result.schedulingProfile;
  }

  if (!schedulingProfile) return { error: NOT_FOUND };

  const segmentedRounds = {};

  const profileRounds = schedulingProfile
    .map(({ venues }) =>
      venues.map(({ rounds }) =>
        rounds.map((round) => {
          const roundRef = getRef(round);
          if (roundRef.roundSegment?.segmentsCount) {
            segmentedRounds[roundRef.ref] = roundRef.roundSegment.segmentsCount;
          }
          return definedAttributes({
            ...roundRef,
            ref: undefined,
          });
        })
      )
    )
    .flat(Infinity);

  return { profileRounds, segmentedRounds };
}

function getRef(obj) {
  const {
    containerStructureId,
    roundSegment,
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
    roundSegment,
    tournamentId,
    eventId,
    drawId,
    structureId: relevantStructureId,
    roundNumber,
  });
}

function getRoundProfile(matchUps) {
  const matchUpsCount = matchUps.length;
  const completedCount =
    matchUps.filter(
      ({ winningSide, matchUpStatus }) =>
        winningSide || completedMatchUpStatuses.includes(matchUpStatus)
    ).length || 0;
  const incompleteCount = matchUpsCount - scheduledCount;
  const isComplete = matchUpsCount === completedCount;
  const scheduledCount =
    matchUps.filter(
      ({ schedule }) => schedule?.scheduledDate && schedule?.scheduledTime
    ).length || 0;
  const unscheduledCount = matchUpsCount - scheduledCount;
  const isScheduled = matchUpsCount - scheduledCount;
  return {
    unscheduledCount,
    incompleteCount,
    scheduledCount,
    completedCount,
    matchUpsCount,
    isScheduled,
    isComplete,
  };
}

export function getRounds({
  excludedScheduledRounds,
  excludeCompletedRounds,
  showSegmentedRounds,
  schedulingProfile,
  tournamentRecords,
}) {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const { segmentedRounds } =
    schedulingProfile || excludeCompletedRounds || showSegmentedRounds
      ? getProfileRounds({ tournamentRecords, schedulingProfile })
      : {};

  const allMatchUps =
    allCompetitionMatchUps({ tournamentRecords })?.matchUps || [];

  let rounds = Object.values(
    allMatchUps.reduce((rounds, matchUp) => {
      const ref = getRef(matchUp).ref;
      const segmentsCount = segmentedRounds?.[ref];
      const matchUps = [...(rounds[ref]?.matchUps ?? []), matchUp];
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
          matchUps,
          roundName,
          roundNumber,
          roundOffset,
          stageSequence,
          segmentsCount,
          structureId: relevantStructureId,
          structureName,
          tournamentId,
        },
      };
    }, {})
  )
    .map((round) => {
      const { minFinishingSum, winnerFinishingPositionRange } =
        getFinishingPositionDetails(round.matchUps);
      const segmentsCount = round.segmentsCount;
      if (segmentsCount) {
        const chunkSize = round.matchUps.length / segmentsCount;
        const sortedMatchUps = chunkArray(
          round.matchUps.sort((a, b) => a.roundPosition - b.roundPosition),
          chunkSize
        );
        return sortedMatchUps.map((matchUps, i) => {
          const {
            unscheduledCount,
            incompleteCount,
            matchUpsCount,
            isScheduled,
            isComplete,
          } = getRoundProfile(matchUps);
          return definedAttributes({
            ...round,
            roundSegment: { segmentsCount, segmentNumber: i + 1 },
            winnerFinishingPositionRange,
            unscheduledCount,
            incompleteCount,
            minFinishingSum,
            matchUpsCount,
            isScheduled,
            isComplete,
            matchUps,
          });
        });
      }

      const {
        unscheduledCount,
        incompleteCount,
        matchUpsCount,
        isScheduled,
        isComplete,
      } = getRoundProfile(round.matchUps);
      return definedAttributes({
        ...round,
        winnerFinishingPositionRange,
        unscheduledCount,
        incompleteCount,
        minFinishingSum,
        matchUpsCount,
        isScheduled,
        isComplete,
      });
    })
    .flat()
    .filter(({ isComplete, isScheduled }) => {
      const keepComplete = !excludeCompletedRounds || !isComplete;
      const keepScheduled = !excludedScheduledRounds || !isScheduled;
      return keepComplete && keepScheduled;
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
