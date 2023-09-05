import { getMatchUpDailyLimits as getDailyLimit } from '../../../tournamentEngine/governors/scheduleGovernor/getMatchUpDailyLimits';

import { MISSING_TOURNAMENT_RECORDS } from '../../../constants/errorConditionConstants';
import { Tournament } from '../../../types/tournamentFromSchema';
import { ResultType } from '../../../global/functions/decorateResult';

type GetMatchUpDailyLimitsArgs = {
  tournamentRecords: { [key: string]: Tournament };
  tournamentId?: string;
};
export function getMatchUpDailyLimits({
  tournamentRecords,
  tournamentId,
}: GetMatchUpDailyLimitsArgs): ResultType & {
  matchUpDailyLimits?: any;
} {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const tournamentIds = Object.keys(tournamentRecords).filter(
    (currentTournamentId) =>
      !tournamentId || currentTournamentId === tournamentId
  );

  let dailyLimits;
  tournamentIds.forEach((tournamentId) => {
    const tournamentRecord = tournamentRecords[tournamentId];

    const { matchUpDailyLimits } = getDailyLimit({
      tournamentRecord,
    });
    dailyLimits = matchUpDailyLimits;
  });

  return { matchUpDailyLimits: dailyLimits };
}
