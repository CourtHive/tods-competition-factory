import { removeDirectedParticipants } from './removeDirectedParticipants';
import { checkConnectedStructures } from './checkConnectedStructures';
import { directParticipants } from './directParticipants';

import { BYE } from '../../../constants/matchUpStatusConstants';

export function attemptToSetWinningSide(props) {
  const { drawDefinition, winningSide, structure, matchUp } = props;
  let errors = [];

  if ([BYE].includes(matchUp.matchUpStatus)) {
    return {
      errors: [{ error: 'Cannot set winningSide for BYE matchUpStatus' }],
    };
  }

  if (matchUp.winningSide && matchUp.winningSide !== winningSide) {
    // TODO: return a message if there are effects in connected structures
    checkConnectedStructures({
      drawDefinition,
      structure,
      matchUp,
    });

    const { errors: participantDirectionErrors } = removeDirectedParticipants(
      props
    );

    if (participantDirectionErrors) {
      errors = errors.concat(participantDirectionErrors);
      return { errors };
    }
  }

  const { errors: participantDirectionErrors } = directParticipants(props);

  if (participantDirectionErrors) {
    errors = errors.concat(participantDirectionErrors);
  }

  return { errors };
}
