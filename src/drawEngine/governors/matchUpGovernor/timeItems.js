import { addTimeItem } from '../../../tournamentEngine/governors/tournamentGovernor/addTimeItem';
import { findMatchUp } from '../../getters/getMatchUps';

import { MATCHUP_NOT_FOUND } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

/*
  generic function to addMatchUpTimeItem
  must retrieve matchUp WITHOUT CONTEXT so original can be modified
*/
export function addMatchUpTimeItem({ drawDefinition, matchUpId, timeItem }) {
  const { matchUp } = findMatchUp({ drawDefinition, matchUpId });
  if (!matchUp) return { error: MATCHUP_NOT_FOUND };

  return addTimeItem({ element: matchUp, timeItem });
}

export function resetMatchUpTimeItems({ drawDefinition, matchUpId }) {
  const { matchUp } = findMatchUp({ drawDefinition, matchUpId });
  if (!matchUp) return { error: MATCHUP_NOT_FOUND };
  matchUp.timeItems = [];
  return SUCCESS;
}
