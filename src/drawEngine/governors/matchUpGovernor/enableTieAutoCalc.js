import { removeExtension } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { updateTieMatchUpScore } from './tieMatchUpScore';

import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { DISABLE_AUTO_CALC } from '../../../constants/extensionConstants';

export function enableTieAutoCalc({
  tournamentRecord,
  drawDefinition,
  matchUpId,
  event,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const { matchUp } = findMatchUp({
    drawDefinition,
    matchUpId,
    event,
  });

  removeExtension({ element: matchUp, name: DISABLE_AUTO_CALC });

  return updateTieMatchUpScore({
    tournamentRecord,
    drawDefinition,
    matchUpId,
    event,
  });
}
