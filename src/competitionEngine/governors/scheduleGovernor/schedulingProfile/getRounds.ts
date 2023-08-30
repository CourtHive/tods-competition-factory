import { validateSchedulingProfile } from '../../../../global/validation/validateSchedulingProfile';
import { findMatchUpFormatTiming } from '../matchUpFormatTiming/findMatchUpFormatTiming';
import { allCompetitionMatchUps } from '../../../getters/matchUpsGetter';
import { chunkArray, instanceCount } from '../../../../utilities';
import { definedAttributes } from '../../../../utilities/objects';
import { extractDate } from '../../../../utilities/dateTime';
import { getSchedulingProfile } from './schedulingProfile';

import { completedMatchUpStatuses } from '../../../../constants/matchUpStatusConstants';
import drawDefinitionConstants from '../../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  ErrorType,
  INVALID_TOURNAMENT_RECORD,
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORDS,
  NOT_FOUND,
} from '../../../../constants/errorConditionConstants';
import { HydratedMatchUp } from '../../../../types/hydrated';
import { Tournament } from '../../../../types/tournamentFromSchema';

const { stageOrder } = drawDefinitionConstants;

type GetProfileRoundsArgs = {
  tournamentRecords?: { [key: string]: Tournament };
  tournamentRecord?: Tournament;
  schedulingProfile?: any;
  withRoundId?: boolean;
};
export function getProfileRounds({
  tournamentRecords,
  schedulingProfile,
  tournamentRecord,
  withRoundId,
}: GetProfileRoundsArgs): {
  segmentedRounds?: { [key: string]: any };
  profileRounds?: any[];
  error?: ErrorType;
} {
  if (tournamentRecord && !tournamentRecords) {
    if (typeof tournamentRecord !== 'object') {
      return { error: INVALID_TOURNAMENT_RECORD };
    } else {
      tournamentRecords = { [tournamentRecord.tournamentId]: tournamentRecord };
    }
  }

  if (schedulingProfile) {
    const profileValidity = validateSchedulingProfile({
      tournamentRecords,
      schedulingProfile,
    });

    if (profileValidity.error) return profileValidity;
  }

  if (!schedulingProfile && tournamentRecords) {
    const result = getSchedulingProfile({ tournamentRecords });
    if (result.error) return result;
    schedulingProfile = result.schedulingProfile;
  }

  if (!schedulingProfile) return { error: NOT_FOUND };

  const segmentedRounds: { [key: string]: any } = {};

  const profileRounds = schedulingProfile
    .map(({ venues, scheduleDate }) =>
      venues.map(({ rounds }) =>
        rounds.map((round) => {
          const roundRef = getRoundId(round);
          if (roundRef.roundSegment?.segmentsCount) {
            segmentedRounds[roundRef.id] = roundRef.roundSegment.segmentsCount;
          }
          return definedAttributes({
            id: withRoundId ? roundRef.id : undefined,
            scheduleDate,
            ...roundRef,
          });
        })
      )
    )
    .flat(Infinity);

  return { profileRounds, segmentedRounds };
}

function getRoundId(obj) {
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
  const id = [
    tournamentId, // 1
    eventId, // 2
    drawId, // 3
    relevantStructureId, // 4
    roundNumber, // 5
  ].join('|');

  return definedAttributes({
    id,
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
  const byeCount =
    matchUps.filter(({ sides }) => sides?.some(({ bye }) => bye)).length || 0;
  const completedCount =
    matchUps.filter(
      ({ winningSide, matchUpStatus }) =>
        winningSide || completedMatchUpStatuses.includes(matchUpStatus)
    ).length || 0;
  const scheduledCount =
    matchUps.filter(
      ({ schedule }) => schedule?.scheduledDate && schedule?.scheduledTime
    ).length || 0;
  const consideredCount = matchUpsCount - byeCount;
  const isComplete = consideredCount === completedCount;
  const unscheduledCount = consideredCount - scheduledCount;
  const incompleteCount = consideredCount - scheduledCount;
  const isScheduled = consideredCount === scheduledCount;
  return {
    unscheduledCount,
    incompleteCount,
    scheduledCount,
    completedCount,
    matchUpsCount,
    isScheduled,
    isComplete,
    byeCount,
  };
}
type GetRoundsArgs = {
  tournamentRecords?: { [key: string]: Tournament };
  excludeScheduleDateProfileRounds?: boolean;
  inContextMatchUps?: HydratedMatchUp[];
  excludeScheduledRounds?: boolean;
  excludeCompletedRounds?: boolean;
  tournamentRecord?: Tournament;
  withSplitRounds?: boolean;
  schedulingProfile?: any;
  withRoundId?: boolean;
  matchUpFilters?: any;
  context?: any;
};
export function getRounds({
  excludeScheduleDateProfileRounds,
  excludeScheduledRounds,
  excludeCompletedRounds,
  inContextMatchUps,
  tournamentRecords,
  schedulingProfile,
  tournamentRecord,
  withSplitRounds,
  matchUpFilters,
  withRoundId,
  context,
}: GetRoundsArgs) {
  if (
    inContextMatchUps &&
    !Array.isArray(
      inContextMatchUps || typeof inContextMatchUps[0] !== 'object'
    )
  ) {
    return { error: INVALID_VALUES, inContextMatchUps };
  }

  if (tournamentRecord && !tournamentRecords) {
    if (typeof tournamentRecord !== 'object') {
      return { error: INVALID_TOURNAMENT_RECORD };
    } else {
      tournamentRecords = { [tournamentRecord.tournamentId]: tournamentRecord };
    }
  }

  const noTournamentRecords =
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length;

  const needsTournamentRecords =
    !inContextMatchUps ||
    (!schedulingProfile &&
      (excludeScheduleDateProfileRounds ||
        excludeCompletedRounds ||
        schedulingProfile ||
        withSplitRounds));

  if (needsTournamentRecords && noTournamentRecords)
    return { error: MISSING_TOURNAMENT_RECORDS };

  const events = Object.values(tournamentRecords || {})
    .map(({ events }) => events)
    .flat();

  const { segmentedRounds, profileRounds } =
    (tournamentRecords &&
      (excludeScheduleDateProfileRounds ||
        excludeCompletedRounds ||
        schedulingProfile ||
        withSplitRounds) &&
      getProfileRounds({ tournamentRecords, schedulingProfile })) ||
    {};

  const profileRoundsMap =
    excludeScheduleDateProfileRounds &&
    Object.assign(
      {},
      ...profileRounds.map((profile) => ({ [profile.id]: profile }))
    );

  const consideredMatchUps =
    inContextMatchUps ||
    (tournamentRecords &&
      allCompetitionMatchUps({ tournamentRecords, matchUpFilters })
        ?.matchUps) ||
    [];

  const excludedRounds: any[] = [];

  const rounds =
    (consideredMatchUps &&
      Object.values(
        consideredMatchUps.reduce((rounds, matchUp) => {
          const id = getRoundId(matchUp).id;
          const segmentsCount = segmentedRounds?.[id];
          const matchUps = [...(rounds[id]?.matchUps ?? []), matchUp];
          const {
            containerStructureId,
            stageSequence,
            structureName,
            tournamentId,
            isRoundRobin,
            matchUpType,
            roundNumber,
            roundOffset,
            structureId,
            eventName,
            roundName,
            drawName,
            eventId,
            drawId,
          } = matchUp;
          const relevantStructureId = isRoundRobin
            ? containerStructureId
            : structureId;
          return {
            ...rounds,
            [id]: {
              id: withRoundId ? id : undefined,
              structureId: relevantStructureId,
              stageSequence,
              segmentsCount,
              structureName,
              tournamentId,
              matchUpType,
              roundNumber,
              roundOffset,
              eventName,
              roundName,
              drawName,
              matchUps,
              eventId,
              drawId,
            },
          };
        }, {})
      )
        .map((round: any) => {
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
                byeCount,
              } = getRoundProfile(matchUps);
              const roundTiming = getRoundTiming({
                matchUps: round.matchUps,
                tournamentRecords,
                events,
                round,
              });
              return definedAttributes({
                ...round,
                ...context,
                roundSegment: { segmentsCount, segmentNumber: i + 1 },
                winnerFinishingPositionRange,
                unscheduledCount,
                incompleteCount,
                minFinishingSum,
                matchUpsCount,
                isScheduled,
                roundTiming,
                isComplete,
                byeCount,
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
            byeCount,
          } = getRoundProfile(round.matchUps);
          const roundTiming = getRoundTiming({
            matchUps: round.matchUps,
            tournamentRecords,
            events,
            round,
          });
          return definedAttributes({
            ...round,
            ...context,
            winnerFinishingPositionRange,
            unscheduledCount,
            incompleteCount,
            minFinishingSum,
            matchUpsCount,
            isScheduled,
            roundTiming,
            isComplete,
            byeCount,
          });
        })
        .flat()
        .filter((round) => {
          if (excludeScheduleDateProfileRounds) {
            const scheduleDate = extractDate(excludeScheduleDateProfileRounds);
            const roundId = withRoundId ? round.id : getRoundId(round).id;
            if (
              scheduleDate &&
              profileRoundsMap[roundId] &&
              extractDate(profileRoundsMap[roundId].scheduleDate) ===
                scheduleDate
            ) {
              return false;
            }
          }
          const { isComplete, isScheduled } = round;
          const keepComplete = !excludeCompletedRounds || !isComplete;
          const keepScheduled = !excludeScheduledRounds || !isScheduled;
          const keepRound = keepComplete && keepScheduled;
          if (!keepRound) excludedRounds.push(round);
          return keepRound;
        })
        .sort(roundSort)) ||
    [];

  return { ...SUCCESS, rounds, excludedRounds };
}

function getRoundTiming({ round, matchUps, events, tournamentRecords }) {
  const event = events.find((event) => event.eventId === round.eventId);
  const { eventType, category, categoryType } = event || {};
  const { categoryName, ageCategoryCode } = category || {};
  const formatCounts = instanceCount(
    matchUps.map(({ matchUpFormat }) => matchUpFormat)
  );

  let roundMinutes = 0;
  Object.keys(formatCounts).forEach((matchUpFormat) => {
    const formatCount = formatCounts[matchUpFormat];
    const result = findMatchUpFormatTiming({
      categoryName: categoryName || ageCategoryCode,
      tournamentId: round.tournamentId,
      eventId: round.eventId,
      tournamentRecords,
      matchUpFormat,
      categoryType,
      eventType,
    });
    if (result.error) return result;
    const formatMinutes = result.averageMinutes * formatCount;
    if (!isNaN(roundMinutes)) roundMinutes += formatMinutes;
    return undefined;
  });

  return { roundMinutes };
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
      const winnerFinishingPositionRange =
        (matchUp.finishingPositionRange?.winner || []).join('-') || '';
      return !foo.minFinishingSum || sum < foo.minFinishingSum
        ? { minFinishingSum: sum, winnerFinishingPositionRange }
        : foo;
    },
    { minFinishingSum: 0, winnerFinishingPositionRange: '' }
  );
}
