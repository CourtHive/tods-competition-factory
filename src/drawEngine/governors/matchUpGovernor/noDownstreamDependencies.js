import { checkDoubleWalkoverPropagation } from './checkDoubleWalkoverPropagation';
import { removeDirectedParticipants } from './removeDirectedParticipants';
import { attemptToSetMatchUpStatus } from './attemptToSetMatchUpStatus';
import { checkConnectedStructures } from './checkConnectedStructures';
import { attemptToSetWinningSide } from './attemptToSetWinningSide';
import { removeDoubleWalkover } from './removeDoubleWalkover';
import { updateTieMatchUpScore } from './tieMatchUpScore';
import { modifyMatchUpScore } from './modifyMatchUpScore';
import { scoreHasValue } from './scoreHasValue';

import {
  ABANDONED,
  DOUBLE_WALKOVER,
  INCOMPLETE,
  TO_BE_PLAYED,
} from '../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function noDownstreamDependencies(props) {
  const { matchUp, matchUpFormat, score, winningSide } = props;
  let { matchUpStatus } = props;

  const doubleWalkoverCleanup =
    matchUp?.matchUpStatus === DOUBLE_WALKOVER &&
    matchUpStatus !== DOUBLE_WALKOVER;
  if (doubleWalkoverCleanup) {
    const result = removeDoubleWalkover(props);
    if (result.error) return result;
  }
  const doubleWalkover = matchUpStatus === DOUBLE_WALKOVER;

  const removeDirected = ({ removeScore } = {}) => {
    const { structure, drawDefinition } = props;
    checkConnectedStructures({ drawDefinition, structure, matchUp });
    Object.assign(props, { removeScore });
    const { errors } = removeDirectedParticipants(props);
    return { errors };
  };

  if (winningSide) {
    const { errors: winningSideErrors } = attemptToSetWinningSide(props);
    if (winningSideErrors?.length) return { errors: winningSideErrors };
  } else if (!winningSide && scoreHasValue({ score }) && !doubleWalkover) {
    if (!matchUpStatus) matchUpStatus = INCOMPLETE;
    const removeScore = ![INCOMPLETE, ABANDONED].includes(matchUpStatus);
    const { errors: participantDirectionErrors } = removeDirected({
      removeScore,
    });
    if (participantDirectionErrors) return participantDirectionErrors;
  } else if (matchUpStatus && matchUpStatus !== TO_BE_PLAYED) {
    const { error } = attemptToSetMatchUpStatus(props);
    if (error) return { errors: [error] };
  } else if (!winningSide && matchUp.winningSide && !scoreHasValue({ score })) {
    const { errors: participantDirectionErrors } = removeDirected();
    if (participantDirectionErrors) return participantDirectionErrors;
  } else if (matchUp) {
    if (matchUp.matchUpStatus === DOUBLE_WALKOVER) {
      const result = checkDoubleWalkoverPropagation(props);
      if (result.error) return result;
    }
    modifyMatchUpScore({
      drawDefinition: props.drawDefinition,
      removeScore: true,
      matchUpFormat,
      matchUp,
    });
    const isCollectionMatchUp = Boolean(matchUp.collectionId);
    if (isCollectionMatchUp) {
      const { drawDefinition, matchUpTieId } = props;
      updateTieMatchUpScore({ drawDefinition, matchUpId: matchUpTieId });
    }
  } else {
    console.log('unknown condition');
  }

  return SUCCESS;
}
