import { hasSchedule } from '../../../competitionEngine/governors/scheduleGovernor/scheduleMatchUps/hasSchedule';
import { completedMatchUpStatuses } from '../../../constants/matchUpStatusConstants';
import { allTournamentMatchUps } from '../../getters/matchUpsGetter/matchUpsGetter';
import { getMatchUpId } from '../../../global/functions/extractors';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  ErrorType,
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import {
  ALLOCATE_COURTS,
  ASSIGN_COURT,
  ASSIGN_VENUE,
  SCHEDULED_DATE,
  SCHEDULED_TIME,
} from '../../../constants/timeItemConstants';
import {
  MatchUpStatusEnum,
  Tournament,
} from '../../../types/tournamentFromSchema';

type ClearScheduledMatchUpsArgs = {
  ignoreMatchUpStatuses?: MatchUpStatusEnum[];
  scheduleAttributes?: string[];
  tournamentRecord: Tournament;
  scheduledDates?: string[];
  venueIds?: string[];
};
export function clearScheduledMatchUps({
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
  if (typeof tournamentRecord !== 'object')
    return { error: MISSING_TOURNAMENT_RECORD };

  if (!Array.isArray(ignoreMatchUpStatuses) || !Array.isArray(venueIds)) {
    return { error: INVALID_VALUES };
  }
  if (venueIds.length) scheduleAttributes.push('venueId');

  const inContextMatchUps =
    allTournamentMatchUps({
      matchUpFilters: { scheduledDates },
      tournamentRecord,
    }).matchUps || [];

  const relevantMatchUpIds = inContextMatchUps
    .filter(
      (matchUp) =>
        matchUp.matchUpStatus &&
        !ignoreMatchUpStatuses.includes(matchUp.matchUpStatus) &&
        hasSchedule({ schedule: matchUp.schedule, scheduleAttributes }) &&
        (!venueIds?.length || venueIds.includes(matchUp.schedule.venueId))
    )
    .map(getMatchUpId);

  const matchUps =
    allTournamentMatchUps({
      tournamentRecord,
      inContext: false,
    }).matchUps || [];

  let clearedScheduleCount = 0;
  for (const matchUp of matchUps) {
    if (relevantMatchUpIds.includes(matchUp.matchUpId)) {
      matchUp.timeItems = (matchUp.timeItems || []).filter(
        (timeItem) =>
          timeItem?.itemType &&
          ![
            ALLOCATE_COURTS,
            ASSIGN_COURT,
            ASSIGN_VENUE,
            SCHEDULED_DATE,
            SCHEDULED_TIME,
          ].includes(timeItem?.itemType)
      );
      clearedScheduleCount += 1;
    }
  }

  return { ...SUCCESS, clearedScheduleCount };
}
