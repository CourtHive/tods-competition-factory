import { addTimeItem } from '../../../tournamentEngine/governors/tournamentGovernor/addTimeItem';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { addNotice } from '../../../global/globalState';

import { MATCHUP_NOT_FOUND } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { MODIFY_MATCHUP } from '../../../constants/topicConstants';

/*
  generic function to addMatchUpTimeItem
  must retrieve matchUp WITHOUT CONTEXT so original can be modified
*/
export function addMatchUpTimeItem({
  drawDefinition,
  matchUpId,
  timeItem,
  duplicateValues,
  disableNotice,
}) {
  const { matchUp } = findMatchUp({ drawDefinition, matchUpId });
  if (!matchUp) return { error: MATCHUP_NOT_FOUND };

  const result = addTimeItem({ element: matchUp, timeItem, duplicateValues });
  if (!disableNotice) {
    addNotice({
      topic: MODIFY_MATCHUP,
      payload: { matchUp },
      key: matchUp.matchUpId,
    });
  }
  return result;
}

export function resetMatchUpTimeItems({ drawDefinition, matchUpId }) {
  const { matchUp } = findMatchUp({ drawDefinition, matchUpId });
  if (!matchUp) return { error: MATCHUP_NOT_FOUND };
  matchUp.timeItems = [];
  addNotice({
    topic: MODIFY_MATCHUP,
    payload: { matchUp },
    key: matchUp.matchUpId,
  });
  return SUCCESS;
}
