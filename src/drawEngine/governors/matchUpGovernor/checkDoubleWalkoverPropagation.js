import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { modifyMatchUpScore } from './modifyMatchUpScore';

import { MISSING_MATCHUP } from '../../../constants/errorConditionConstants';
import {
  DOUBLE_WALKOVER,
  TO_BE_PLAYED,
} from '../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function checkDoubleWalkoverPropagation(props) {
  const {
    targetMatchUps: { winnerMatchUp },
  } = props.targetData;
  if (winnerMatchUp?.matchUpStatus === DOUBLE_WALKOVER) {
    const {
      tournamentRecord,
      event,
      drawDefinition,
      mappedMatchUps,
      matchUpId,
    } = props;
    const { matchUp: noContextWinnerMatchUp } = findMatchUp({
      drawDefinition,
      mappedMatchUps,
      matchUpId: winnerMatchUp.matchUpId,
    });
    if (!noContextWinnerMatchUp) return { error: MISSING_MATCHUP };
    modifyMatchUpScore({
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
