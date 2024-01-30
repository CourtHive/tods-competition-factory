import { removeExtension } from '../../extensions/removeExtension';
import { findDrawMatchUp } from '../../../acquire/findDrawMatchUp';

import { DELEGATED_OUTCOME } from '@Constants/extensionConstants';
import { MATCHUP_NOT_FOUND, MISSING_DRAW_DEFINITION, MISSING_MATCHUP_ID } from '@Constants/errorConditionConstants';

export function removeDelegatedOutcome({ drawDefinition, event, matchUpId }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  const { matchUp } = findDrawMatchUp({ drawDefinition, event, matchUpId });
  if (!matchUp) return { error: MATCHUP_NOT_FOUND };

  return removeExtension({
    name: DELEGATED_OUTCOME,
    element: matchUp,
  });
}
