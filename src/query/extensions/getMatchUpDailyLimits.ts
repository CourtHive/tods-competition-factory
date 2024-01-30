import { checkRequiredParameters } from '@Helpers/parameters/checkRequiredParameters';
import { findExtension } from '@Acquire/findExtension';

// constants and types
import { MISSING_TOURNAMENT_RECORDS } from '@Constants/errorConditionConstants';
import { POLICY_TYPE_SCHEDULING } from '@Constants/policyConstants';
import { TOURNAMENT_RECORD } from '@Constants/attributeConstants';
import { SCHEDULE_LIMITS } from '@Constants/extensionConstants';
import { Tournament } from '@Types/tournamentTypes';
import { ResultType } from '@Types/factoryTypes';
import { findPolicy } from '../../acquire/findPolicy';

type GetMatchUpDailyLimitsArgs = {
  tournamentRecords: { [key: string]: Tournament };
  tournamentId?: string;
};
export function getMatchUpDailyLimits({ tournamentRecords, tournamentId }: GetMatchUpDailyLimitsArgs): ResultType & {
  matchUpDailyLimits?: any;
} {
  if (typeof tournamentRecords !== 'object' || !Object.keys(tournamentRecords).length)
    return { error: MISSING_TOURNAMENT_RECORDS };

  const tournamentIds = Object.keys(tournamentRecords).filter(
    (currentTournamentId) => !tournamentId || currentTournamentId === tournamentId,
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

export function getDailyLimit(params): ResultType & {
  matchUpDailyLimits?: number;
} {
  const paramCheck = checkRequiredParameters(params, [{ [TOURNAMENT_RECORD]: true }]);
  if (paramCheck.error) return paramCheck;

  const { tournamentRecord } = params;
  const { policy } = findPolicy({
    policyType: POLICY_TYPE_SCHEDULING,
    tournamentRecord,
  });

  const { extension } = findExtension({
    element: tournamentRecord,
    name: SCHEDULE_LIMITS,
  });

  const tournamentDailyLimits = extension?.value?.dailyLimits;
  const policyDailyLimits = policy?.defaultDailyLimits;

  return { matchUpDailyLimits: tournamentDailyLimits || policyDailyLimits };
}
