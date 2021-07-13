import { attachPolicy as attachTournamentPolicy } from '../../../tournamentEngine/governors/policyGovernor/policyManagement';

import { MISSING_TOURNAMENT_RECORDS } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function attachPolicy({ tournamentRecords, policyDefinition }) {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = attachTournamentPolicy({
      tournamentRecord,
      policyDefinition,
      allowReplacement: true,
    });
    if (result.error) {
      return result;
    }
  }

  return SUCCESS;
}
