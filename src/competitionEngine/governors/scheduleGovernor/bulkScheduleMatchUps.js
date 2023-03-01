import { bulkScheduleMatchUps as bulkSchedule } from '../../../tournamentEngine/governors/scheduleGovernor/bulkScheduleMatchUps';
import { getMatchUpDependencies } from './scheduleMatchUps/getMatchUpDependencies';
import { getMatchUpId } from '../../../global/functions/extractors';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../constants/errorConditionConstants';

export function bulkScheduleMatchUps({
  errorOnAnachronism,
  matchUpContextIds,
  tournamentRecords,
  checkChronology,
  schedule,
}) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!Array.isArray(matchUpContextIds)) return { error: INVALID_VALUES };
  const warnings = [];

  const { matchUpDependencies } = getMatchUpDependencies({
    tournamentRecords,
  });

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const { tournamentId } = tournamentRecord;
    const matchUpIds = matchUpContextIds
      .filter((contextIds) => contextIds.tournamentId === tournamentId)
      .map(getMatchUpId);

    if (matchUpIds?.length) {
      const result = bulkSchedule({
        matchUpDependencies,
        errorOnAnachronism,
        tournamentRecord,
        checkChronology,
        matchUpIds,
        schedule,
      });
      if (result.warnings?.length) warnings.push(...result.warnings);
      if (result.error) return result;
    }
  }

  return warnings.length ? { ...SUCCESS, warnings } : { ...SUCCESS };
}
