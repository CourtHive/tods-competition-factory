import { removeDirectedParticipants } from './removeDirectedParticipants';
import { checkConnectedStructures } from './checkConnectedStructures';
import { directParticipants } from './directParticipants';

import { BYE } from '../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function attemptToSetWinningSide(props) {
  const { drawDefinition, winningSide, structure, matchUp } = props;

  if ([BYE].includes(matchUp.matchUpStatus)) {
    return { error: 'Cannot set winningSide for BYE matchUpStatus' };
  }

  if (matchUp.winningSide && matchUp.winningSide !== winningSide) {
    // TODO: return a message if there are effects in connected structures
    checkConnectedStructures({
      drawDefinition,
      structure,
      matchUp,
    });

    const result = removeDirectedParticipants(props);
    if (result.error) return result;
  }

  const result = directParticipants(props);
  if (result.error) return result;

  return { ...SUCCESS };
}
