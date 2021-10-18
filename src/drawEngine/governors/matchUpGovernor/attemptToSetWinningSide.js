import { removeDirectedParticipants } from './removeDirectedParticipantsAndUpdateOutcome';
import { checkConnectedStructures } from './checkConnectedStructures';
import { directParticipants } from './directParticipants';

import { SUCCESS } from '../../../constants/resultConstants';

export function attemptToSetWinningSide(params) {
  const { drawDefinition, winningSide, structure, matchUp } = params;
  let connectedStructures;

  if (matchUp.winningSide && matchUp.winningSide !== winningSide) {
    // only applies when progression is based on WIN_RATIO, e.g. ROUND_ROBIN_WITH_PLAYOFF
    const { connectedStructureIds } = checkConnectedStructures({
      drawDefinition,
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
  if (result.error) return result;

  return { ...SUCCESS, connectedStructures };
}
