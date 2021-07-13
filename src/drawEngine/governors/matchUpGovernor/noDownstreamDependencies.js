import { checkDoubleWalkoverPropagation } from './checkDoubleWalkoverPropagation';
import { removeDirectedParticipants } from './removeDirectedParticipants';
import { attemptToSetMatchUpStatus } from './attemptToSetMatchUpStatus';
import { checkConnectedStructures } from './checkConnectedStructures';
import { attemptToSetWinningSide } from './attemptToSetWinningSide';
import { removeDoubleWalkover } from './removeDoubleWalkover';
import { modifyMatchUpScore } from './modifyMatchUpScore';
import { scoreHasValue } from './scoreHasValue';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  ABANDONED,
  DOUBLE_WALKOVER,
  INCOMPLETE,
  TO_BE_PLAYED,
} from '../../../constants/matchUpStatusConstants';

export function noDownstreamDependencies(params) {
  const { matchUp, matchUpStatus, score, winningSide } = params;

  const doubleWalkoverCleanup =
    matchUp?.matchUpStatus === DOUBLE_WALKOVER &&
    matchUpStatus !== DOUBLE_WALKOVER;
  if (doubleWalkoverCleanup) {
    const result = removeDoubleWalkover(params);
    if (result.error) return result;
  }

  const doubleWalkover = matchUpStatus === DOUBLE_WALKOVER;
  const scoreWithNoWinningSide =
    !winningSide && scoreHasValue({ score }) && !doubleWalkover;
  const removeScore = ![INCOMPLETE, ABANDONED].includes(
    matchUpStatus || INCOMPLETE
  );

  const removeWinningSide =
    matchUp.winningSide && !winningSide && !scoreHasValue({ score });

  const existingWOWO = matchUp?.matchUpStatus === DOUBLE_WALKOVER;
  const statusNotTBP = matchUpStatus && matchUpStatus !== TO_BE_PLAYED;

  const removeDirected = ({ removeScore } = {}) => {
    const { structure, drawDefinition } = params;
    checkConnectedStructures({ drawDefinition, structure, matchUp });
    Object.assign(params, { removeScore });
    return removeDirectedParticipants(params);
  };

  return (
    (winningSide && attemptToSetWinningSide(params)) ||
    (scoreWithNoWinningSide && removeDirected({ removeScore })) ||
    (statusNotTBP && attemptToSetMatchUpStatus(params)) ||
    (removeWinningSide && removeDirected()) ||
    (existingWOWO && checkDoubleWalkoverPropagation(params)) ||
    (matchUp && modifyMatchUpScore({ ...params, removeScore: true })) ||
    (console.log('unknown condition') && { ...SUCCESS })
  );
}
