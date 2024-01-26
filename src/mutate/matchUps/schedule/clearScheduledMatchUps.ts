import { resolveTournamentRecords } from '@Helpers/parameters/resolveTournamentRecords';
import { allTournamentMatchUps } from '@Query/matchUps/getAllTournamentMatchUps';
import { hasSchedule } from './scheduleMatchUps/hasSchedule';
import { getMatchUpId } from '@Functions/global/extractors';
import { isObject } from '@Tools/objects';

// constants and types
import { completedMatchUpStatuses } from '../../../constants/matchUpStatusConstants';
import { MatchUpStatusUnion, Tournament } from '../../../types/tournamentTypes';
import { TournamentRecords, ResultType } from '../../../types/factoryTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  ErrorType,
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../constants/errorConditionConstants';
import {
  ALLOCATE_COURTS,
  ASSIGN_COURT,
  ASSIGN_VENUE,
  SCHEDULED_DATE,
  SCHEDULED_TIME,
} from '../../../constants/timeItemConstants';

type ClearScheduledMatchUpsArgs = {
  ignoreMatchUpStatuses?: MatchUpStatusUnion[];
  tournamentRecords?: TournamentRecords;
  tournamentRecord?: Tournament;
  scheduleAttributes?: string[];
  scheduledDates: string[];
  venueIds?: string[];
};
export function clearScheduledMatchUps(params: ClearScheduledMatchUpsArgs): ResultType & {
  clearedScheduleCount?: number;
} {
  const {
    scheduleAttributes = ['scheduledDate', 'scheduledTime'],
    ignoreMatchUpStatuses = completedMatchUpStatuses,
    scheduledDates,
    venueIds,
  } = params;

  const tournamentRecords = resolveTournamentRecords(params);

  const tournamentIds = isObject(tournamentRecords)
    ? Object.values(tournamentRecords)
        .map(({ tournamentId }) => tournamentId)
        .filter(Boolean)
    : [];
  if (!tournamentIds?.length) return { error: MISSING_TOURNAMENT_RECORDS };

  let clearedScheduleCount = 0;
  for (const tournamentId of tournamentIds) {
    const tournamentRecord = tournamentRecords[tournamentId];
    const result = clearSchedules({
      ignoreMatchUpStatuses,
      scheduleAttributes,
      tournamentRecord,
      scheduledDates,
      venueIds,
    });
    if (result.error) return result;
    clearedScheduleCount += result.clearedScheduleCount ?? 0;
  }

  return { ...SUCCESS, clearedScheduleCount };
}

function clearSchedules({
  scheduleAttributes = ['scheduledDate', 'scheduledTime'],
  ignoreMatchUpStatuses = completedMatchUpStatuses,
  tournamentRecord,
  scheduledDates,
  venueIds = [],
}: ClearScheduledMatchUpsArgs): {
  clearedScheduleCount?: number;
  success?: boolean;
  error?: ErrorType;
} {
  if (typeof tournamentRecord !== 'object') return { error: MISSING_TOURNAMENT_RECORD };

  if (!Array.isArray(ignoreMatchUpStatuses) || !Array.isArray(venueIds)) {
    return { error: INVALID_VALUES };
  }
  if (venueIds.length) scheduleAttributes.push('venueId');

  const inContextMatchUps =
    allTournamentMatchUps({
      matchUpFilters: { scheduledDates },
      tournamentRecord,
    }).matchUps ?? [];

  const relevantMatchUpIds = inContextMatchUps
    .filter(
      (matchUp) =>
        matchUp.matchUpStatus &&
        !ignoreMatchUpStatuses.includes(matchUp.matchUpStatus) &&
        hasSchedule({ schedule: matchUp.schedule, scheduleAttributes }) &&
        (!venueIds?.length || venueIds.includes(matchUp.schedule.venueId)),
    )
    .map(getMatchUpId);

  const matchUps =
    allTournamentMatchUps({
      tournamentRecord,
      inContext: false,
    }).matchUps ?? [];

  let clearedScheduleCount = 0;
  for (const matchUp of matchUps) {
    if (relevantMatchUpIds.includes(matchUp.matchUpId)) {
      matchUp.timeItems = (matchUp.timeItems ?? []).filter(
        (timeItem) =>
          timeItem?.itemType &&
          ![ALLOCATE_COURTS, ASSIGN_COURT, ASSIGN_VENUE, SCHEDULED_DATE, SCHEDULED_TIME].includes(timeItem?.itemType),
      );
      clearedScheduleCount += 1;
    }
  }

  return { ...SUCCESS, clearedScheduleCount };
}
