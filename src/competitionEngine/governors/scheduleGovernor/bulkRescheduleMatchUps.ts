import { bulkRescheduleMatchUps as bulkReschedule } from '../../../tournamentEngine/governors/scheduleGovernor/bulkRescheduleMatchUps';
import { getMatchUpIds } from '../../../global/functions/extractors';

import { ResultType } from '../../../global/functions/decorateResult';
import { Tournament } from '../../../types/tournamentFromSchema';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_MATCHUP_IDS,
} from '../../../constants/errorConditionConstants';

type BulkRescheduleMatchUpsArgs = {
  tournamentRecords: { [key: string]: Tournament };
  matchUpIds: string[];
  scheduleChange: any;
  dryRun?: boolean;
};
export function bulkRescheduleMatchUps({
  tournamentRecords,
  scheduleChange,
  matchUpIds,
  dryRun,
}: BulkRescheduleMatchUpsArgs): ResultType & {
  allRescheduled?: boolean;
  notRescheduled?: any[];
  rescheduled?: any[];
} {
  if (!matchUpIds || !Array.isArray(matchUpIds))
    return { error: MISSING_MATCHUP_IDS };
  if (typeof scheduleChange !== 'object') return { error: INVALID_VALUES };

  const rescheduled: any[] = [];
  let notRescheduled: any[] = [];

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = bulkReschedule({
      tournamentRecord,
      scheduleChange,
      matchUpIds,
      dryRun,
    });
    if (result.error) return result;

    if (Array.isArray(result.notRescheduled))
      notRescheduled.push(...result.notRescheduled);

    // this is a check in case something has been rescheduled multiple times in the same call
    const notRescheduledIds = getMatchUpIds(result.notRescheduled);
    const removeFromNotScheduledIds: string[] = [];
    result.rescheduled?.forEach((matchUp) => {
      const { matchUpId } = matchUp;
      if (notRescheduledIds.includes(matchUpId)) {
        removeFromNotScheduledIds.push(matchUpId);
      }
      rescheduled.push(matchUp);
    });

    if (removeFromNotScheduledIds.length) {
      notRescheduled =
        result?.notRescheduled?.filter(
          ({ matchUpId }) => !removeFromNotScheduledIds.includes(matchUpId)
        ) || [];
    }
  }

  const allRescheduled = !!(rescheduled.length && !notRescheduled.length);

  return { ...SUCCESS, rescheduled, notRescheduled, allRescheduled };
}
