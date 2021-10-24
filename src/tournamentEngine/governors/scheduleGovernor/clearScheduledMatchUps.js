import { hasSchedule } from '../../../competitionEngine/governors/scheduleGovernor/scheduleMatchUps/hasSchedule';
import { completedMatchUpStatuses } from '../../../constants/matchUpStatusConstants';
import { allTournamentMatchUps } from '../../getters/matchUpsGetter';
import { getMatchUpId } from '../../../global/functions/extractors';
import { bulkScheduleMatchUps } from './bulkScheduleMatchUps';

import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

/**
 *
 * @param {string[]} scheduleAttributes - attributes by which it is determined that a matchUp as a schedule
 * @param {boolean} ignoreMatchUpStatuses - array of matchUpStatuses to ignore; defaults to completed
 * @param {object} tournamentRecord - provided automatically by tournamentEngine
 * @param {string[]} scheduleDates - optional - array of schedule dates to be cleared; default is to clear all dates
 * @param {string[]} venueIds - optional - array of specific venueIds to be cleared
 * @returns
 */
export function clearScheduledMatchUps({
  scheduleAttributes = ['scheduledDate', 'scheduledTime'],
  ignoreMatchUpStatuses = completedMatchUpStatuses,
  tournamentRecord,
  scheduledDates,
  venueIds = [],
}) {
  if (typeof tournamentRecord !== 'object')
    return { error: MISSING_TOURNAMENT_RECORD };

  if (!Array.isArray(ignoreMatchUpStatuses) || !Array.isArray(venueIds)) {
    return { error: INVALID_VALUES };
  }
  if (venueIds.length) scheduleAttributes.push('venueId');

  const { matchUps } = allTournamentMatchUps({
    matchUpFilters: { scheduledDates },
    tournamentRecord,
  });

  const relevantMatchUpIds = matchUps
    .filter(
      (matchUp) =>
        !ignoreMatchUpStatuses.includes(matchUp.matchUpStatus) &&
        hasSchedule({ schedule: matchUp.schedule, scheduleAttributes }) &&
        (!venueIds?.length || venueIds.includes(matchUp.schedule.venueId))
    )
    .map(getMatchUpId);

  const clearedScheduleValues = {
    venueId: '',
    scheduledDate: '',
    scheduledTime: '',
  };

  return bulkScheduleMatchUps({
    schedule: clearedScheduleValues,
    matchUpIds: relevantMatchUpIds,
    tournamentRecord,
  });
}
