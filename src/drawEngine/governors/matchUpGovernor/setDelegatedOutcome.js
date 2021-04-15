import { addDrawDefinitionExtension } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';

import {
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { DELEGATED_OUTCOME } from '../../../constants/extensionConstants';

export function setDelegatedOutcome({ drawDefinition, matchUpId, outcome }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpId) return { error: MISSING_MATCHUP };
  if (!outcome) return { error: MISSING_VALUE };

  // TODO: check validity of outcome

  const extension = {
    name: DELEGATED_OUTCOME,
    value: outcome,
  };
  const result = addDrawDefinitionExtension({ drawDefinition, extension });
  if (result.error) return result;

  return SUCCESS;
}
