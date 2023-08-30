import { bulkScheduleMatchUps as bulkSchedule } from '../../../tournamentEngine/governors/scheduleGovernor/bulkScheduleMatchUps';
import { getMatchUpDependencies } from './scheduleMatchUps/getMatchUpDependencies';
import { getMatchUpId } from '../../../global/functions/extractors';

import { Tournament } from '../../../types/tournamentFromSchema';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

type BulkScheduleMatchUpsArgs = {
  tournamentRecords: { [key: string]: Tournament };
  errorOnAnachronism?: boolean;
  checkChronology?: boolean;
  matchUpContextIds?: any;
  matchUpDetails: any;
  schedule?: any;
};
export function bulkScheduleMatchUps({
  errorOnAnachronism,
  matchUpContextIds,
  tournamentRecords,
  checkChronology,
  matchUpDetails,
  schedule,
}: BulkScheduleMatchUpsArgs) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!Array.isArray(matchUpContextIds) && !Array.isArray(matchUpDetails))
    return { error: INVALID_VALUES };

  if ((!matchUpDetails || matchUpContextIds) && !schedule)
    return { error: MISSING_VALUE, info: 'schedule is required' };

  const warnings: any[] = [];
  let scheduled = 0;

  const { matchUpDependencies } = getMatchUpDependencies({
    tournamentRecords,
  });

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const { tournamentId } = tournamentRecord;
    const matchUpIds = matchUpContextIds
      ?.filter((contextIds) => contextIds.tournamentId === tournamentId)
      .map(getMatchUpId);

    const tournamentMatchUpDetails = matchUpDetails?.filter(
      (details) => details?.tournamentId === tournamentId
    );

    if (matchUpIds?.length || tournamentMatchUpDetails?.length) {
      const result = bulkSchedule({
        matchUpDetails: tournamentMatchUpDetails,
        matchUpDependencies,
        errorOnAnachronism,
        tournamentRecords,
        tournamentRecord,
        checkChronology,
        matchUpIds,
        schedule,
      });
      if (result.warnings?.length) warnings.push(...result.warnings);
      if (result.scheduled) scheduled += result.scheduled;
      if (result.error) return result;
    }
  }

  return warnings.length
    ? { ...SUCCESS, scheduled, warnings }
    : { ...SUCCESS, scheduled };
}
