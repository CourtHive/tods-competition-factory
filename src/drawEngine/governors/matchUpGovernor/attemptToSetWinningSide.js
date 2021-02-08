import { removeDirectedParticipants } from './removeDirectedParticipants';
import { checkConnectedStructures } from './checkConnectedStructures';
import { isDirectingMatchUpStatus } from './checkStatusType';
import { directParticipants } from './directParticipants';

import {
  BYE,
  COMPLETED,
  DOUBLE_WALKOVER,
} from '../../../constants/matchUpStatusConstants';

export function attemptToSetWinningSide(props) {
  const {
    drawDefinition,
    matchUpStatus,
    matchUpStatusCodes,
    winningSide,
    structure,
    matchUp,
  } = props;
  let errors = [];

  if ([BYE, DOUBLE_WALKOVER].includes(matchUp.matchUpStatus)) {
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
  } else {
    // check that matchUpStatus is not incompatible with winningSide
    if (matchUpStatus && isDirectingMatchUpStatus({ matchUpStatus })) {
      matchUp.matchUpStatus = matchUpStatus || COMPLETED;
      matchUp.matchUpStatusCodes = matchUpStatus && matchUpStatusCodes;
    } else {
      // determine appropriate matchUpStatus;
      matchUp.matchUpStatus = COMPLETED;
      matchUp.matchUpStatusCodes = matchUpStatusCodes;
    }
  }

  return { errors };
}
