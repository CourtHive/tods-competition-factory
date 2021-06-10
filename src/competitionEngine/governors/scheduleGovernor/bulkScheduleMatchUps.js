import { bulkScheduleMatchUps as bulkSchedule } from '../../../tournamentEngine/governors/scheduleGovernor/bulkScheduleMatchUps';

import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function bulkScheduleMatchUps({
  tournamentRecords,

  matchUpContextIds,
  schedule,
}) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!Array.isArray(matchUpContextIds)) return { error: INVALID_VALUES };

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const { tournamentId } = tournamentRecord;
    const matchUpIds = matchUpContextIds
      .filter((contextIds) => contextIds.tournamentId === tournamentId)
      .map(({ matchUpId }) => matchUpId);

    if (matchUpIds?.length) {
      const result = bulkSchedule({
        tournamentRecord,
        matchUpIds,
        schedule,
      });
      if (result.error) return result;
    }
  }

  return SUCCESS;
}
