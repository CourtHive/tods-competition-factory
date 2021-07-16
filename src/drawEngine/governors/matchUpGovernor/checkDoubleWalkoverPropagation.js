import { modifyMatchUpScore } from './modifyMatchUpScore';

import { MISSING_MATCHUP } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  DOUBLE_WALKOVER,
  TO_BE_PLAYED,
} from '../../../constants/matchUpStatusConstants';
import { getDevContext } from '../../../global/globalState';

export function checkDoubleWalkoverPropagation(params) {
  const {
    targetMatchUps: { winnerMatchUp },
  } = params.targetData;

  if (getDevContext({ WOWO: true })) {
    console.log('checkDoubleWalkoverPropagation');
  }

  if (winnerMatchUp?.matchUpStatus === DOUBLE_WALKOVER) {
    const { tournamentRecord, event, drawDefinition, matchUpId, matchUpsMap } =
      params;

    const noContextWinnerMatchUp = matchUpsMap?.drawMatchUps.find(
      (matchUp) => matchUp.matchUpId === winnerMatchUp.matchUpId
    );

    if (!noContextWinnerMatchUp) return { error: MISSING_MATCHUP };

    return modifyMatchUpScore({
      matchUpId,
      drawDefinition,
      removeScore: true,
      matchUpStatus: TO_BE_PLAYED,
      matchUp: noContextWinnerMatchUp,
      tournamentRecord,
      event,
    });
  }
  return SUCCESS;
}
