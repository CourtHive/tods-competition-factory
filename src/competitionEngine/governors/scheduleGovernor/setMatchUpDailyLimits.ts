import { setMatchUpDailyLimits as setDailyLimits } from '../../../tournamentEngine/governors/scheduleGovernor/setMatchUpDailyLimits';

import { ResultType } from '../../../global/functions/decorateResult';
import { Tournament } from '../../../types/tournamentFromSchema';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../constants/errorConditionConstants';

type SetMatchUpDailyLimitsArgs = {
  tournamentRecords: { [key: string]: Tournament };
  tournamentId: string;
  dailyLimits: any;
};
export function setMatchUpDailyLimits({
  tournamentRecords,
  tournamentId,
  dailyLimits,
}: SetMatchUpDailyLimitsArgs): ResultType {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const tournamentIds = Object.keys(tournamentRecords).filter(
    (currentTournamentId) =>
      !tournamentId || tournamentId === currentTournamentId
  );

  if (tournamentId && !tournamentIds.includes(tournamentId))
    return { error: INVALID_VALUES };

  for (const currentTournamentId of tournamentIds) {
    const tournamentRecord = tournamentRecords[currentTournamentId];
    const result = setDailyLimits({
      tournamentRecord,
      dailyLimits,
    });
    if (result.error) return result;
  }

  return { ...SUCCESS };
}
