import { removeDirectedParticipants } from './removeDirectedParticipants';
import { decorateResult } from '../../../global/functions/decorateResult';
import { checkConnectedStructures } from './checkConnectedStructures';
import { definedAttributes } from '../../../utilities/objects';
import { attemptToModifyScore } from './attemptToModifyScore';
import { directParticipants } from './directParticipants';

import { SUCCESS } from '../../../constants/resultConstants';

export function attemptToSetWinningSide(params) {
  const stack = 'attemptToSetWinningSide';

  const {
    disableAutoCalc,
    drawDefinition,
    matchUpsMap,
    dualMatchUp,
    winningSide,
    structure,
    matchUp,
  } = params;
  let connectedStructures;

  // disableAutoCalc means the score is being set manually
  if (dualMatchUp?._disableAutoCalc && disableAutoCalc !== false) {
    return attemptToModifyScore(params);
  }

  if (matchUp.winningSide && matchUp.winningSide !== winningSide) {
    // only applies when progression is based on WIN_RATIO, e.g. ROUND_ROBIN_WITH_PLAYOFF
    const { connectedStructureIds } = checkConnectedStructures({
      drawDefinition,
      matchUpsMap,
      structure,
      matchUp,
    });
    if (connectedStructureIds.length) {
      // TODO: return a message if there are effects in connected structures
      console.log({ connectedStructureIds });
      connectedStructures = true;
    }

    const result = removeDirectedParticipants(params);

    if (result.error) return result;
  }

  const result = directParticipants(params);
  if (result.error) return decorateResult({ result, stack });

  return decorateResult({
    result: definedAttributes({ ...SUCCESS, connectedStructures }),
    stack,
  });
}
