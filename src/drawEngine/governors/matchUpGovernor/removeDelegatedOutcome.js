import {
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP,
} from '../../../constants/errorConditionConstants';
import { DELEGATED_OUTCOME } from '../../../constants/extensionConstants';
import { removeDrawDefinitionExtension } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';

export function removeDelegatedOutcome({ drawDefinition, matchUpId }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpId) return { error: MISSING_MATCHUP };

  return removeDrawDefinitionExtension({
    drawDefinition,
    name: DELEGATED_OUTCOME,
  });
}
