import { updateTieMatchUpScore } from './tieMatchUpScore';
import { modifyMatchUpScore } from './modifyMatchUpScore';

import { INCOMPLETE } from '../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function attemptToSetIncompleteScore(props) {
  const { drawDefinition, matchUp, matchUpStatus, score } = props;

  delete matchUp.winningSide;
  modifyMatchUpScore({
    drawDefinition,
    matchUp,
    matchUpStatus: matchUpStatus || INCOMPLETE,
    matchUpStatusCodes: [],
    score,
  });

  const isCollectionMatchUp = Boolean(matchUp.collectionId);
  if (isCollectionMatchUp) {
    const { matchUpTieId } = props;
    updateTieMatchUpScore({ drawDefinition, matchUpId: matchUpTieId });
  }

  return SUCCESS;
}
