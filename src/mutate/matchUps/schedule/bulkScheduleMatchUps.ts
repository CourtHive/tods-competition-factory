import { getMatchUpDependencies } from '../../../query/matchUps/getMatchUpDependencies';
import { checkRequiredParameters } from '../../../parameters/checkRequiredParameters';
import { bulkScheduleTournamentMatchUps } from './bulkScheduleTournamentMatchUps';
import { getMatchUpId } from '../../../global/functions/extractors';

import { Tournament } from '../../../types/tournamentTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';
import {
  ARRAY,
  INVALID,
  OF_TYPE,
  ONE_OF,
  TOURNAMENT_RECORDS,
} from '../../../constants/attributeConstants';

type BulkScheduleMatchUpsArgs = {
  tournamentRecords: { [key: string]: Tournament };
  scheduleCompletedMatchUps?: boolean;
  tournamentRecord?: Tournament;
  scheduleByeMatchUps?: boolean;
  errorOnAnachronism?: boolean;
  removePriorValues?: boolean;
  checkChronology?: boolean;
  matchUpContextIds?: any;
  matchUpIds?: string[];
  matchUpDetails: any;
  schedule?: any;
};
export function bulkScheduleMatchUps(params: BulkScheduleMatchUpsArgs) {
  const {
    scheduleCompletedMatchUps = false,
    scheduleByeMatchUps = false,
    errorOnAnachronism,
    matchUpContextIds,
    removePriorValues,
    tournamentRecords,
    checkChronology,
    matchUpDetails,
    schedule,
  } = params;

  if (params.matchUpIds && !matchUpContextIds)
    return bulkScheduleTournamentMatchUps(params);

  const paramsCheck = checkRequiredParameters(params, [
    { [TOURNAMENT_RECORDS]: true },
    {
      [ONE_OF]: { matchUpContextIds: true, matchUpDetails: true },
      [INVALID]: INVALID_VALUES,
      [OF_TYPE]: ARRAY,
    },
  ]);
  if (paramsCheck.error) return paramsCheck;

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
      const result = bulkScheduleTournamentMatchUps({
        matchUpDetails: tournamentMatchUpDetails,
        scheduleCompletedMatchUps,
        scheduleByeMatchUps,
        matchUpDependencies,
        errorOnAnachronism,
        removePriorValues,
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
