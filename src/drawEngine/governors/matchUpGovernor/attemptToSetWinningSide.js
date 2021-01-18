import { removeDirectedParticipants } from './removeDirectedParticipants';
import { isDirectingMatchUpStatus } from './checkStatusType';
import { directParticipants } from './directParticipants';

import { COMPLETED } from '../../../constants/matchUpStatusConstants';

export function attemptToSetWinningSide(props) {
  const { matchUp, matchUpStatus, matchUpStatusCodes, winningSide } = props;
  let errors = [];

  if (matchUp.winningSide && matchUp.winningSide !== winningSide) {
    const { errors: participantDirectionErrors } = removeDirectedParticipants(
      props
    );

    if (participantDirectionErrors) {
      errors = errors.concat(participantDirectionErrors);
      return { errors };
    }
  }

  // TESTED
  const { errors: participantDirectionErrors } = directParticipants(props);

  if (participantDirectionErrors) {
    errors = errors.concat(participantDirectionErrors);
    // TESTED
  } else {
    // check that matchUpStatus is not incompatible with winningSide
    if (matchUpStatus && isDirectingMatchUpStatus({ matchUpStatus })) {
      matchUp.matchUpStatus = matchUpStatus || COMPLETED;
      matchUp.matchUpStatusCodes = matchUpStatus && matchUpStatusCodes;
      // TESTED
    } else {
      // determine appropriate matchUpStatus;
      matchUp.matchUpStatus = COMPLETED;
      matchUp.matchUpStatusCodes = matchUpStatusCodes;
      // TESTED
    }
  }

  return { errors };
}
