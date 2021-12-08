import { hasSchedule } from '../../../competitionEngine/governors/scheduleGovernor/scheduleMatchUps/hasSchedule';
import { completedMatchUpStatuses } from '../../../constants/matchUpStatusConstants';
import { allTournamentMatchUps } from '../../getters/matchUpsGetter';
import { getMatchUpId } from '../../../global/functions/extractors';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import {
  ASSIGN_COURT,
  ASSIGN_VENUE,
  SCHEDULED_DATE,
  SCHEDULED_TIME,
} from '../../../constants/timeItemConstants';

/**
 *
 * @param {string[]} scheduleAttributes - attributes by which it is determined that a matchUp has a schedule
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

  const { matchUps: inContextMatchUps } = allTournamentMatchUps({
    matchUpFilters: { scheduledDates },
    tournamentRecord,
  });

  const relevantMatchUpIds = inContextMatchUps
    .filter(
      (matchUp) =>
        !ignoreMatchUpStatuses.includes(matchUp.matchUpStatus) &&
        hasSchedule({ schedule: matchUp.schedule, scheduleAttributes }) &&
        (!venueIds?.length || venueIds.includes(matchUp.schedule.venueId))
    )
    .map(getMatchUpId);

  const { matchUps } = allTournamentMatchUps({
    tournamentRecord,
    inContext: false,
  });

  for (const matchUp of matchUps) {
    if (relevantMatchUpIds.includes(matchUp.matchUpId)) {
      matchUp.timeItems = (matchUp.timeItems || []).filter(
        (timeItem) =>
          ![
            ASSIGN_COURT,
            ASSIGN_VENUE,
            SCHEDULED_DATE,
            SCHEDULED_TIME,
          ].includes(timeItem?.itemType)
      );
    }
  }

  return { ...SUCCESS };
}
