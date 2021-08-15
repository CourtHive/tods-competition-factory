import { addTimeItem } from '../../../tournamentEngine/governors/tournamentGovernor/addTimeItem';
import { modifyMatchUpNotice } from '../../notifications/drawNotifications';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';

import { MATCHUP_NOT_FOUND } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

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
    modifyMatchUpNotice({ drawDefinition, matchUp });
  }
  return result;
}

export function resetMatchUpTimeItems({ drawDefinition, matchUpId }) {
  const { matchUp } = findMatchUp({ drawDefinition, matchUpId });
  if (!matchUp) return { error: MATCHUP_NOT_FOUND };
  matchUp.timeItems = [];
  modifyMatchUpNotice({ drawDefinition, matchUp });
  return { ...SUCCESS };
}
