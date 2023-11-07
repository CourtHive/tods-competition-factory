import { removeExtension } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { findDrawMatchUp } from '../../getters/getMatchUps/findDrawMatchUp';

import { DELEGATED_OUTCOME } from '../../../constants/extensionConstants';
import {
  MATCHUP_NOT_FOUND,
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP_ID,
} from '../../../constants/errorConditionConstants';

export function removeDelegatedOutcome({ drawDefinition, event, matchUpId }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  const { matchUp } = findDrawMatchUp({ drawDefinition, event, matchUpId });
  if (!matchUp) return { error: MATCHUP_NOT_FOUND };

  return removeExtension({
    element: matchUp,
    name: DELEGATED_OUTCOME,
  });
}
