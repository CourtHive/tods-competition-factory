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
    scoreHasValue({ score }) &&
    !doubleWalkover &&
    ((params.isCollectionMatchUp && !params.projectedWinningSide) ||
      !winningSide);

  const removeScore = ![INCOMPLETE, ABANDONED].includes(
    matchUpStatus || INCOMPLETE
  );

  const removeWinningSide =
    (params.isCollectionMatchUp &&
      params.dualMatchUp.winningSide &&
      !params.projectedWinningSide) ||
    (matchUp.winningSide && !winningSide && !scoreHasValue({ score }));

  const statusNotTBP = matchUpStatus && matchUpStatus !== TO_BE_PLAYED;

  const removeDirected = ({ removeScore } = {}) => {
    let connectedStructures;
    const { structure, drawDefinition } = params;
    const { connectedStructureIds } = checkConnectedStructures({
      drawDefinition,
      structure,
      matchUp,
    }); // only relevant to WIN_RATIO progression

    if (connectedStructureIds.length) {
      // TODO: return a message if there are effects in connected structures
      console.log({ connectedStructureIds });
      connectedStructures = true;
    }

    Object.assign(params, { removeScore });
    const result = removeDirectedParticipants(params);
    if (result.error) return result;
    return { ...SUCCESS, connectedStructures };
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
  const removeDirected =
    params.isCollectionMatchUp &&
    params.dualMatchUp?.winningSide &&
    params.projectedWinningSide;
  const result = modifyMatchUpScore({ ...params, removeScore: true });

  // recalculate dualMatchUp score if isCollectionMatchUp
  if (isCollectionMatchUp) {
    const { matchUpTieId, drawDefinition } = params;
    const { removeWinningSide } = updateTieMatchUpScore({
      matchUpId: matchUpTieId,
      drawDefinition,
    });
    console.log('ndd', { removeWinningSide, removeDirected });
  }

  return result;
}
