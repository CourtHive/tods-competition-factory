import { getMatchUpDailyLimitsUpdate as getUpdate } from '../../../tournamentEngine/governors/scheduleGovernor/getMatchUpDailyLimitsUpdate';
import { MISSING_TOURNAMENT_RECORDS } from '../../../constants/errorConditionConstants';

export function getMatchUpDailyLimitsUpdate({ tournamentRecords }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };

  const tournamentIds = Object.keys(tournamentRecords);

  const methods = tournamentIds
    .map((tournamentId) => {
      const tournamentRecord = tournamentRecords[tournamentId];
      const methods = getUpdate({ tournamentRecord })?.methods || [];
      methods.foreach((method) =>
        Object.assign(method.params({ tournamentId }))
      );
      return methods;
    })
    .flat()
    .filter((f) => f);

  return { methods };
}
