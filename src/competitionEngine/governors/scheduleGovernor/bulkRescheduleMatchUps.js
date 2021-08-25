import { bulkRescheduleMatchUps as bulkReschedule } from '../../../tournamentEngine/governors/scheduleGovernor/bulkRescheduleMatchUps';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_MATCHUP_IDS,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../constants/errorConditionConstants';

export function bulkRescheduleMatchUps({
  tournamentRecords,
  scheduleChange,
  matchUpIds,
  dryRun,
}) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!matchUpIds || !Array.isArray(matchUpIds))
    return { error: MISSING_MATCHUP_IDS };
  if (typeof scheduleChange !== 'object') return { error: INVALID_VALUES };

  const rescheduled = [];
  let notRescheduled = [];

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = bulkReschedule({
      tournamentRecord,
      scheduleChange,
      matchUpIds,
      dryRun,
    });
    notRescheduled.push(...result.notRescheduled);
    if (result.error) return result;

    // this is a check in case something has been rescheduled multiple times in the same call
    const notRescheduledIds =
      result.notRescheduled?.map(({ matchUpId }) => matchUpId) || [];
    const removeFromNotScheduledIds = [];
    result.rescheduled?.forEach((matchUp) => {
      const { matchUpId } = matchUp;
      if (notRescheduledIds.includes(matchUpId)) {
        removeFromNotScheduledIds.push(matchUpId);
      }
      rescheduled.push(matchUp);
    });

    if (removeFromNotScheduledIds.length) {
      notRescheduled =
        result?.notRescheduled.filter(
          ({ matchUpId }) => !removeFromNotScheduledIds.includes(matchUpId)
        ) || [];
    }
  }

  const allRescheduled = rescheduled.length && !notRescheduled.length;

  return { ...SUCCESS, rescheduled, notRescheduled, allRescheduled };
}
