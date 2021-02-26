import { updateTieMatchUpScore } from './tieMatchUpScore';
import { modifyMatchUpScore } from './modifyMatchUpScore';

import {
  CANCELLED,
  INCOMPLETE,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function attemptToSetIncompleteScore(props) {
  const { drawDefinition, matchUp, matchUpStatus, score } = props;

  const removeScore = [CANCELLED, WALKOVER].includes(matchUpStatus);
  delete matchUp.winningSide;
  modifyMatchUpScore({
    drawDefinition,
    matchUp,
    matchUpStatus: matchUpStatus || INCOMPLETE,
    matchUpStatusCodes: [],
    removeScore,
    score,
  });

  const isCollectionMatchUp = Boolean(matchUp.collectionId);
  if (isCollectionMatchUp) {
    const { matchUpTieId } = props;
    updateTieMatchUpScore({ drawDefinition, matchUpId: matchUpTieId });
  }

  return SUCCESS;
}
