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

    const { errors: participantDirectionErrors } =
      removeDirectedParticipants(props);

    if (participantDirectionErrors) {
      return { error: participantDirectionErrors };
    }
  }

  const { errors: participantDirectionErrors } = directParticipants(props);

  if (participantDirectionErrors) {
    return { error: participantDirectionErrors };
  }

  return { ...SUCCESS };
}
