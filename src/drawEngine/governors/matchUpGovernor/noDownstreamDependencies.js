import { removeDirectedParticipants } from './removeDirectedParticipantsAndUpdateOutcome';
import { attemptToSetMatchUpStatus } from './attemptToSetMatchUpStatus';
import { checkConnectedStructures } from './checkConnectedStructures';
import { attemptToSetWinningSide } from './attemptToSetWinningSide';
import { removeDoubleWalkover } from './removeDoubleWalkover';
import { updateTieMatchUpScore } from './tieMatchUpScore';
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

  const statusNotTBP = matchUpStatus && matchUpStatus !== TO_BE_PLAYED;

  const removeDirected = ({ removeScore } = {}) => {
    const { structure, drawDefinition } = params;
    checkConnectedStructures({ drawDefinition, structure, matchUp }); // only relevant to WIN_RATIO progression
    Object.assign(params, { removeScore });
    return removeDirectedParticipants(params);
  };

  return (
    (winningSide && attemptToSetWinningSide(params)) ||
    (scoreWithNoWinningSide && removeDirected({ removeScore })) ||
    (statusNotTBP && attemptToSetMatchUpStatus(params)) ||
    (removeWinningSide && removeDirected()) ||
    (matchUp && scoreModification({ ...params, removeScore: true })) ||
    (console.log('unknown condition') && { ...SUCCESS })
  );
}

function scoreModification(params) {
  const isCollectionMatchUp = Boolean(params.matchUp.collectionId);
  const result = modifyMatchUpScore({ ...params, removeScore: true });

  // recalculate dualMatchUp score if isCollectionMatchUp
  if (isCollectionMatchUp) {
    const { matchUpTieId, drawDefinition } = params;
    updateTieMatchUpScore({
      matchUpId: matchUpTieId,
      drawDefinition,
    });
  }

  return result;
}
