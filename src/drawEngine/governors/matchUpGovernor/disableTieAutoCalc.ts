import { addExtension } from '../../../global/functions/producers/addExtension';
import { findDrawMatchUp } from '../../../acquire/findDrawMatchUp';

import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { DISABLE_AUTO_CALC } from '../../../constants/extensionConstants';

export function disableTieAutoCalc({ drawDefinition, matchUpId, event }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const { matchUp } = findDrawMatchUp({
    drawDefinition,
    matchUpId,
    event,
  });

  return addExtension({
    extension: { name: DISABLE_AUTO_CALC, value: true },
    element: matchUp,
  });
}
