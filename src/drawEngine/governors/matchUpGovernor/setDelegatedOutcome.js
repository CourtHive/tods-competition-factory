import { addExtension } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';

import {
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { DELEGATED_OUTCOME } from '../../../constants/extensionConstants';

export function setDelegatedOutcome({
  drawDefinition,
  matchUp,
  matchUpId,
  outcome,
}) {
  if (!matchUp && !drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpId) return { error: MISSING_MATCHUP };
  if (!outcome) return { error: MISSING_VALUE };

  if (!matchUp) {
    const { error, matchUp: sourceMatchUp } = findMatchUp({
      drawDefinition,
      matchUpId,
    });
    if (error) return { error };
    matchUp = sourceMatchUp;
  }

  // TODO: check validity of outcome
  const extension = {
    name: DELEGATED_OUTCOME,
    value: outcome,
  };
  const result = addExtension({ element: matchUp, extension });
  if (result.error) return result;

  return SUCCESS;
}
