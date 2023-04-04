import { removeDirectedParticipants } from './removeDirectedParticipants';
import { decorateResult } from '../../../global/functions/decorateResult';
import { attemptToSetMatchUpStatus } from './attemptToSetMatchUpStatus';
import { checkConnectedStructures } from './checkConnectedStructures';
import { attemptToSetWinningSide } from './attemptToSetWinningSide';
import { removeDoubleExit } from './removeDoubleExit';
import { updateTieMatchUpScore } from './tieMatchUpScore';
import { modifyMatchUpScore } from './modifyMatchUpScore';
import { scoreHasValue } from '../../../matchUpEngine/governors/queryGovernor/scoreHasValue';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  ABANDONED,
  DOUBLE_DEFAULT,
  DOUBLE_WALKOVER,
  INCOMPLETE,
  TO_BE_PLAYED,
} from '../../../constants/matchUpStatusConstants';

export function noDownstreamDependencies(params) {
  const { matchUp, matchUpStatus, score, winningSide } = params;
  const stack = 'noDownStreamDependencies';

  const doubleExitCleanup =
    [DOUBLE_WALKOVER, DOUBLE_DEFAULT].includes(matchUp?.matchUpStatus) &&
    ![DOUBLE_WALKOVER, DOUBLE_DEFAULT].includes(matchUpStatus);
  if (doubleExitCleanup) {
    const result = removeDoubleExit(params);
    if (result.error) return decorateResult({ result, stack });
  }

  const doubleWalkover = matchUpStatus === DOUBLE_WALKOVER;
  const scoreWithNoWinningSide =
    scoreHasValue({ score }) &&
    !doubleWalkover &&
    ((params.isCollectionMatchUp && !params.projectedWinningSide) ||
      !winningSide);

  const removeScore =
    params.removeScore ||
    ![INCOMPLETE, ABANDONED].includes(matchUpStatus || INCOMPLETE);

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

  if (removeWinningSide && winningSide && params.isCollectionMatchUp) {
    // this is only possible if a TEAM dualMatchUp has an SINGLES/DOUBLES matchUp winningSide change
    return scoreModification(params);
  }

  const result =
    (winningSide && attemptToSetWinningSide(params)) ||
    (scoreWithNoWinningSide && removeDirected({ removeScore })) ||
    (statusNotTBP && attemptToSetMatchUpStatus(params)) ||
    (removeWinningSide && removeDirected({ removeScore })) ||
    (matchUp && scoreModification({ ...params, removeScore: true })) ||
    (console.log('unknown condition') && { ...SUCCESS });

  return decorateResult({ result, stack });
}

function scoreModification(params) {
  const stack = 'scoreModification';
  const removeDirected =
    params.isCollectionMatchUp &&
    params.dualMatchUp?.winningSide &&
    !params.projectedWinningSide;

  if (removeDirected) {
    const result = removeDirectedParticipants(params);
    if (result.error) return result;
  }
  const result = modifyMatchUpScore({ ...params });

  // recalculate dualMatchUp score if isCollectionMatchUp
  if (params.isCollectionMatchUp) {
    const { matchUpTieId, drawDefinition, event } = params;
    const { removeWinningSide } = updateTieMatchUpScore({
      tournamentRecord: params.tournamentRecord,
      matchUpId: matchUpTieId,
      drawDefinition,
      event,
    });

    if (removeWinningSide) console.log('REMOVE WINNING SIDE');
  }

  return decorateResult({ result, stack });
}
