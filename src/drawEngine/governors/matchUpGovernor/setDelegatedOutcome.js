import { addExtension } from '../../../global/functions/producers/addExtension';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';

import { DELEGATED_OUTCOME } from '../../../constants/extensionConstants';
import {
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function setDelegatedOutcome({
  drawDefinition,
  matchUpId,
  outcome,
  matchUp,
}) {
  if (!matchUp && !drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!outcome) return { error: MISSING_VALUE, info: 'missing outcome' };
  if (!matchUp && !matchUpId) return { error: MISSING_MATCHUP };

  if (!matchUp) {
    const result = findMatchUp({
      drawDefinition,
      matchUpId,
    });
    if (result.error) return result;
    matchUp = result.matchUp;
  }

  if (
    typeof outcome !== 'object' ||
    !outcome.score?.scoreStringSide1 ||
    !outcome.score?.scoreStringSide2
  ) {
    return { error: INVALID_VALUES };
  }

  // TODO: check validity of outcome
  const extension = {
    name: DELEGATED_OUTCOME,
    value: outcome,
  };

  return addExtension({ element: matchUp, extension });
}
