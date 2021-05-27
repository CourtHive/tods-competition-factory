import { findTournamentExtension } from '../queryGovernor/extensionQueries';
import { findPolicy } from '../policyGovernor/findPolicy';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { POLICY_TYPE_SCHEDULING } from '../../../constants/policyConstants';
import { SCHEDULE_LIMITS } from '../../../constants/extensionConstants';

export function getMatchUpDailyLimits({ tournamentRecord }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const { policy } = findPolicy({
    policyType: POLICY_TYPE_SCHEDULING,
    tournamentRecord,
  });

  const { extension } = findTournamentExtension({
    name: SCHEDULE_LIMITS,
  });

  const tournamentDailyLimits = extension?.value?.dailyLimits;
  const policyDailyLimits = policy?.defaultDailyLimits;

  return { matchUpDailyLimits: tournamentDailyLimits || policyDailyLimits };
}
