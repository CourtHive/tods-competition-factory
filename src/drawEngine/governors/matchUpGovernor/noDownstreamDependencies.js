import { checkDoubleWalkoverPropagation } from './checkDoubleWalkoverPropagation';
import { removeDirectedParticipants } from './removeDirectedParticipants';
import { attemptToSetMatchUpStatus } from './attemptToSetMatchUpStatus';
import { checkConnectedStructures } from './checkConnectedStructures';
import { attemptToSetWinningSide } from './attemptToSetWinningSide';
import { removeDoubleWalkover } from './removeDoubleWalkover';
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
  const {
    matchUp,
    matchUpId,
    matchUpFormat,
    score,
    winningSide,
    tournamentRecord,
    event,
  } = props;
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
    return removeDirectedParticipants(props);
  };

  if (winningSide) {
    const result = attemptToSetWinningSide(props);
    if (result.error) return result;
  } else if (!winningSide && scoreHasValue({ score }) && !doubleWalkover) {
    if (!matchUpStatus) matchUpStatus = INCOMPLETE;
    const removeScore = ![INCOMPLETE, ABANDONED].includes(matchUpStatus);
    const result = removeDirected({ removeScore });
    if (result.error) return result;
  } else if (matchUpStatus && matchUpStatus !== TO_BE_PLAYED) {
    const { error } = attemptToSetMatchUpStatus(props);
    if (error) return { error };
  } else if (!winningSide && matchUp.winningSide && !scoreHasValue({ score })) {
    const result = removeDirected();
    if (result.error) return result;
  } else if (matchUp) {
    if (matchUp.matchUpStatus === DOUBLE_WALKOVER) {
      const result = checkDoubleWalkoverPropagation(props);
      if (result.error) return result;
    }
    modifyMatchUpScore({
      drawDefinition: props.drawDefinition,
      removeScore: true,
      matchUpFormat,
      matchUpId,
      matchUp,
      tournamentRecord,
      event,
    });
  } else {
    console.log('unknown condition');
  }

  return SUCCESS;
}
