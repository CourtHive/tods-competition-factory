import { findExtension } from '../../../acquire/findExtension';
import { findPolicy } from '../policyGovernor/findPolicy';

import { checkRequiredParameters } from '../../../parameters/checkRequiredParameters';
import { POLICY_TYPE_SCHEDULING } from '../../../constants/policyConstants';
import { SCHEDULE_LIMITS } from '../../../constants/extensionConstants';
import { ResultType } from '../../../global/functions/decorateResult';

export function getMatchUpDailyLimits(params): ResultType & {
  matchUpDailyLimits?: number;
} {
  const paramCheck = checkRequiredParameters(params, [
    { param: 'tournamentRecord' },
  ]);
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
