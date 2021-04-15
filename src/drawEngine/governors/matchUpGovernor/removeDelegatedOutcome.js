import { removeExtension } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';

import {
  MATCHUP_NOT_FOUND,
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP,
} from '../../../constants/errorConditionConstants';
import { DELEGATED_OUTCOME } from '../../../constants/extensionConstants';

export function removeDelegatedOutcome({ drawDefinition, matchUpId }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpId) return { error: MISSING_MATCHUP };

  const { matchUp } = findMatchUp({ drawDefinition, matchUpId });
  if (!matchUp) return { error: MATCHUP_NOT_FOUND };

  return removeExtension({
    element: matchUp,
    name: DELEGATED_OUTCOME,
  });
}
