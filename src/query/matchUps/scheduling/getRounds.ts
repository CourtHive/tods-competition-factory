import { getFinishingPositionDetails, getRoundId, getRoundProfile, getRoundTiming } from './schedulingUtils';
import { allCompetitionMatchUps } from '../../matchUps/getAllCompetitionMatchUps';
import { getProfileRounds } from '../../../mutate/matchUps/schedule/profileRounds';
import { definedAttributes } from '../../../tools/definedAttributes';
import { roundSort } from '../../../functions/sorters/roundSort';
import { extractDate } from '../../../tools/dateTime';
import { chunkArray } from '../../../tools/arrays';

import { MatchUpFilters } from '../../../types/factoryTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import { Tournament } from '../../../types/tournamentTypes';
import { HydratedMatchUp } from '../../../types/hydrated';
import {
  INVALID_TOURNAMENT_RECORD,
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../constants/errorConditionConstants';

type GetRoundsArgs = {
  tournamentRecords?: { [key: string]: Tournament };
  excludeScheduleDateProfileRounds?: string;
  inContextMatchUps?: HydratedMatchUp[];
  excludeScheduledRounds?: boolean;
  excludeCompletedRounds?: boolean;
  context?: { [key: string]: any };
  matchUpFilters?: MatchUpFilters;
  tournamentRecord?: Tournament;
  withSplitRounds?: boolean;
  schedulingProfile?: any;
  scheduleDate?: string;
  withRoundId?: boolean;
  venueId?: string;
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
  scheduleDate,
  withRoundId,
  venueId,
  context,
}: GetRoundsArgs) {
  if (inContextMatchUps && !Array.isArray(inContextMatchUps || typeof inContextMatchUps[0] !== 'object')) {
    return { error: INVALID_VALUES, inContextMatchUps };
  }

  if (tournamentRecord && !tournamentRecords) {
    if (typeof tournamentRecord !== 'object') {
      return { error: INVALID_TOURNAMENT_RECORD };
    } else {
      tournamentRecords = { [tournamentRecord.tournamentId]: tournamentRecord };
    }
  }

  const noTournamentRecords = typeof tournamentRecords !== 'object' || !Object.keys(tournamentRecords).length;

  const needsTournamentRecords =
    venueId ||
    scheduleDate ||
    !inContextMatchUps ||
    (!schedulingProfile &&
      (excludeScheduleDateProfileRounds || excludeCompletedRounds || schedulingProfile || withSplitRounds));

  if (needsTournamentRecords && noTournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };

  const tournamentVenueIds = Object.assign(
    {},
    ...Object.values(tournamentRecords ?? {}).map(({ venues = [], tournamentId }) => ({
      [tournamentId]: venues?.map(({ venueId }) => venueId),
    })),
  );

  const events = Object.values(tournamentRecords ?? {})
    .map(({ events = [], tournamentId, startDate, endDate }) =>
      events.map((event) => ({
        ...event,
        validVenueIds: tournamentVenueIds[tournamentId],
        startDate: event.startDate ?? startDate,
        endDate: event.endDate ?? endDate,
      })),
    )
    .flat();

  const { segmentedRounds, profileRounds } =
    (tournamentRecords &&
      (excludeScheduleDateProfileRounds || excludeCompletedRounds || schedulingProfile || withSplitRounds) &&
      getProfileRounds({ tournamentRecords, schedulingProfile })) ||
    {};

  const profileRoundsMap =
    excludeScheduleDateProfileRounds &&
    Object.assign({}, ...profileRounds.map((profile) => ({ [profile.id]: profile })));

  const consideredMatchUps =
    inContextMatchUps ||
    (tournamentRecords && allCompetitionMatchUps({ tournamentRecords, matchUpFilters })?.matchUps) ||
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
          const relevantStructureId = isRoundRobin ? containerStructureId : structureId;
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
        }, {}),
      )
        .map((round: any) => {
          const { minFinishingSum, winnerFinishingPositionRange } = getFinishingPositionDetails(round.matchUps);
          const segmentsCount = round.segmentsCount;

          if (segmentsCount) {
            const chunkSize = round.matchUps.length / segmentsCount;
            const sortedMatchUps = chunkArray(
              round.matchUps.sort((a, b) => a.roundPosition - b.roundPosition),
              chunkSize,
            );
            return sortedMatchUps.map((matchUps, i) => {
              const { unscheduledCount, incompleteCount, matchUpsCount, isScheduled, isComplete, byeCount } =
                getRoundProfile(matchUps);

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

          const { unscheduledCount, incompleteCount, matchUpsCount, isScheduled, isComplete, byeCount } =
            getRoundProfile(round.matchUps);
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
              extractDate(profileRoundsMap[roundId].scheduleDate) === scheduleDate
            ) {
              return false;
            }
          }
          const { isComplete, isScheduled } = round;
          const keepComplete = !excludeCompletedRounds || !isComplete;
          const keepScheduled = !excludeScheduledRounds || !isScheduled;
          const event = venueId || scheduleDate ? events?.find(({ eventId }) => eventId === round.eventId) : undefined;

          const startDate = event?.startDate ?? tournamentRecord?.startDate;
          const endDate = event?.endDate ?? tournamentRecord?.endDate;
          const validStartDate = !scheduleDate || !startDate || new Date(scheduleDate) >= new Date(startDate);
          const validEndDate = !scheduleDate || !endDate || new Date(scheduleDate) <= new Date(endDate);
          const validDate = validStartDate && validEndDate;

          const validVenue = !venueId || event?.validVenueIds.includes(venueId);

          const keepRound = keepComplete && keepScheduled && validVenue && validDate;
          if (!keepRound) excludedRounds.push(round);

          return keepRound;
        })
        .sort(roundSort)) ||
    [];

  return { ...SUCCESS, rounds, excludedRounds };
}
