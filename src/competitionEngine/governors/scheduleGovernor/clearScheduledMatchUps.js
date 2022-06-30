import { clearScheduledMatchUps as clearSchedules } from '../../../tournamentEngine/governors/scheduleGovernor/clearScheduledMatchUps';
import { completedMatchUpStatuses } from '../../../constants/matchUpStatusConstants';

import { MISSING_TOURNAMENT_RECORDS } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

/**
 * @param {string[]} scheduleAttributes - attributes by which it is determined that a matchUp as a schedule
 * @param {boolean} ignoreMatchUpStatuses - array of matchUpStatuses to ignore; defaults to completed
 * @param {object} tournamentRecord - provided automatically by tournamentEngine
 * @param {string[]} scheduledDates - optional - array of schedule dates to be cleared; default is to clear all dates
 * @param {string[]} venueIds - optional array of specific venueIds to be cleared
 */
export function clearScheduledMatchUps({
  scheduleAttributes = ['scheduledDate', 'scheduledTime'],
  ignoreMatchUpStatuses = completedMatchUpStatuses,
  tournamentRecords,
  scheduledDates,
  venueIds,
}) {
  const tournamentIds =
    typeof tournamentRecords === 'object' &&
    Object.values(tournamentRecords)
      .map(({ tournamentId }) => tournamentId)
      .filter(Boolean);
  if (!tournamentIds?.length) return { error: MISSING_TOURNAMENT_RECORDS };

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
  }

  return { ...SUCCESS };
}
