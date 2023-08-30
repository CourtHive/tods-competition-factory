import { attachPolicies as attachTournamentPolicies } from '../../../tournamentEngine/governors/policyGovernor/policyManagement';

import { MISSING_TOURNAMENT_RECORDS } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { Tournament } from '../../../types/tournamentFromSchema';

type AttachPoliciesArgs = {
  tournamentRecords: { [key: string]: Tournament };
  policyDefinitions: any;
};
export function attachPolicies({
  tournamentRecords,
  policyDefinitions,
}: AttachPoliciesArgs) {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = attachTournamentPolicies({
      allowReplacement: true,
      tournamentRecord,
      policyDefinitions,
    });
    if (result.error) return result;
  }

  return { ...SUCCESS };
}
