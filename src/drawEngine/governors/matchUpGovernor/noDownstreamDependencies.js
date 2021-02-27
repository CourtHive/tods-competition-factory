import { checkDoubleWalkoverPropagation } from './checkDoubleWalkoverPropagation';
import { removeDirectedParticipants } from './removeDirectedParticipants';
import { attemptToSetIncompleteScore } from './attemptToSetIncompleteScore';
import { attemptToSetMatchUpStatus } from './attemptToSetMatchUpStatus';
import { checkConnectedStructures } from './checkConnectedStructures';
import { attemptToSetWinningSide } from './attemptToSetWinningSide';
import { removeDoubleWalkover } from './removeDoubleWalkover';
import { updateTieMatchUpScore } from './tieMatchUpScore';
import { modifyMatchUpScore } from './modifyMatchUpScore';
import { scoreHasValue } from './scoreHasValue';

import {
  CANCELLED,
  DOUBLE_WALKOVER,
  TO_BE_PLAYED,
} from '../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function noDownstreamDependencies(props) {
  const { matchUp, matchUpStatus, score, winningSide } = props;

  const doubleWalkoverCleanup =
    matchUp?.matchUpStatus === DOUBLE_WALKOVER &&
    matchUpStatus !== DOUBLE_WALKOVER;
  if (doubleWalkoverCleanup) {
    const result = removeDoubleWalkover(props);
    if (result.error) return result;
  }
  const removeScore = [CANCELLED, DOUBLE_WALKOVER].includes(matchUpStatus);

  if (winningSide) {
    const { errors: winningSideErrors } = attemptToSetWinningSide(props);
    if (winningSideErrors?.length) return { errors: winningSideErrors };
  } else if (!winningSide && scoreHasValue({ score }) && !removeScore) {
    // ABANDONED, INCOMPLETE
    const { errors: incompleteScoreErrors } = attemptToSetIncompleteScore(
      props
    );
    if (incompleteScoreErrors) return incompleteScoreErrors;
  } else if (matchUpStatus && matchUpStatus !== TO_BE_PLAYED) {
    // DOUBLE_WALKOVER, CANCELLED
    const { error } = attemptToSetMatchUpStatus(props);
    if (error) return { errors: [error] };
  } else if (!winningSide && matchUp.winningSide && !scoreHasValue({ score })) {
    const { structure, drawDefinition } = props;
    checkConnectedStructures({ drawDefinition, structure, matchUp });

    const { errors: participantDirectionErrors } = removeDirectedParticipants(
      props
    );
    if (participantDirectionErrors) return participantDirectionErrors;
  } else if (matchUp) {
    if (matchUp.matchUpStatus === DOUBLE_WALKOVER) {
      const result = checkDoubleWalkoverPropagation(props);
      if (result.error) return result;
      /*
      const {
        targetMatchUps: { winnerMatchUp },
      } = props.targetData;
      if (winnerMatchUp?.matchUpStatus === DOUBLE_WALKOVER) {
        const { drawDefinition, mappedMatchUps } = props;
        const { matchUp: noContextWinnerMatchUp } = findMatchUp({
          drawDefinition,
          mappedMatchUps,
          matchUpId: winnerMatchUp.matchUpId,
        });
        if (!noContextWinnerMatchUp) return { error: MISSING_MATCHUP };
        modifyMatchUpScore({
          drawDefinition,
          removeScore: true,
          matchUpStatus: TO_BE_PLAYED,
          matchUp: noContextWinnerMatchUp,
        });
      }
      */
    }
    modifyMatchUpScore({
      drawDefinition: props.drawDefinition,
      removeScore: true,
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
