import { clearScheduledMatchUps as clearSchedules } from '../../../tournamentEngine/governors/scheduleGovernor/clearScheduledMatchUps';

import { MISSING_TOURNAMENT_RECORDS } from '../../../constants/errorConditionConstants';
import { completedMatchUpStatuses } from '../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function clearScheduledMatchUps({
  scheduleAttributes = ['scheduledDate', 'scheduledTime'],
  ignoreMatchUpStatuses = completedMatchUpStatuses,
  tournamentRecords,
  scheduledDates,
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
    });
    if (result.error) return result;
  }

  return { ...SUCCESS };
}
