import { addExtension } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
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
  if (!matchUp && !matchUpId) return { error: MISSING_MATCHUP };
  if (!outcome) return { error: MISSING_VALUE };

  if (!matchUp) {
    const { error, matchUp: sourceMatchUp } = findMatchUp({
      drawDefinition,
      matchUpId,
    });
    if (error) return { error };
    matchUp = sourceMatchUp;
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
