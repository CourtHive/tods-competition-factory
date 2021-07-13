import { removeDirectedParticipants } from './removeDirectedParticipants';
import { checkConnectedStructures } from './checkConnectedStructures';
import { directParticipants } from './directParticipants';

import { SUCCESS } from '../../../constants/resultConstants';

export function attemptToSetWinningSide(params) {
  const { drawDefinition, winningSide, structure, matchUp } = params;

  if (matchUp.winningSide && matchUp.winningSide !== winningSide) {
    // TODO: return a message if there are effects in connected structures
    // only applies when progression is based on WIN_RATIO, e.g. ROUND_ROBIN_WITH_PLAYOFF
    checkConnectedStructures({
      drawDefinition,
      structure,
      matchUp,
    });

    const result = removeDirectedParticipants(params);
    if (result.error) return result;
  }

  const result = directParticipants(params);
  if (result.error) return result;

  return { ...SUCCESS };
}
