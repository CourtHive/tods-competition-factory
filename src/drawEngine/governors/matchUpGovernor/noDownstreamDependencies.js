import { removeDirectedParticipants } from './removeDirectedParticipants';
import { attemptToSetIncompleteScore } from './attemptToSetIncompleteScore';
import { attemptToSetMatchUpStatus } from './attemptToSetMatchUpStatus';
import { attemptToSetWinningSide } from './attemptToSetWinningSide';
import { updateTieMatchUpScore } from './tieMatchUpScore';

import { SUCCESS } from '../../../constants/resultConstants';
import { checkConnectedStructures } from './checkConnectedStructures';
import { TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';

export function noDownstreamDependencies(props) {
  const { matchUp, matchUpStatus, score, winningSide } = props;
  let errors = [],
    message;

  if (winningSide) {
    const { errors: winningSideErrors } = attemptToSetWinningSide(props);
    if (winningSideErrors) errors = errors.concat(winningSideErrors);
  } else if (matchUpStatus) {
    const { error } = attemptToSetMatchUpStatus(props);
    if (error) errors = errors.concat(error);
  } else if (!winningSide && score?.sets?.length) {
    const { errors: incompleteScoreErrors } = attemptToSetIncompleteScore(
      props
    );
    if (incompleteScoreErrors) errors = errors.concat(incompleteScoreErrors);
  } else if (!winningSide && matchUp.winningSide && !score?.sets?.length) {
    const { structure, drawDefinition } = props;
    // TODO: return a message if there are effects in connected structures
    checkConnectedStructures({ drawDefinition, structure, matchUp });
    const { errors: participantDirectionErrors } = removeDirectedParticipants(
      props
    );
    if (participantDirectionErrors) {
      errors = errors.concat(participantDirectionErrors);
      return { errors };
    }
  } else if (matchUp) {
    delete matchUp.score;
    delete matchUp.winningSide;
    matchUp.matchUpStatus = TO_BE_PLAYED;
    const isCollectionMatchUp = Boolean(matchUp.collectionId);
    if (isCollectionMatchUp) {
      const { drawDefinition, matchUpTieId } = props;
      updateTieMatchUpScore({ drawDefinition, matchUpId: matchUpTieId });
    }
  } else {
    console.log('unknown condition');
  }

  if (errors.length) {
    return { errors };
  } else {
    const result = SUCCESS;
    if (message) Object.assign(result, { message });
    return result;
  }
}

/*
function attemptToSetIncompleteScore(props) {
  const { drawDefinition, matchUp, score } = props;
  const errors = [];

  modifyMatchUpScore({
    drawDefinition,
    matchUp,
    matchUpStatus: INCOMPLETE,
    matchUpStatusCodes: [],
    score,
  });
  delete matchUp.winningSide;

  const isCollectionMatchUp = Boolean(matchUp.collectionId);
  if (isCollectionMatchUp) {
    const { matchUpTieId } = props;
    updateTieMatchUpScore({ drawDefinition, matchUpId: matchUpTieId });
  }

  return { errors };
}
*/
