import { findMatchUp } from '../../getters/getMatchUps';
import {
  INVALID_TIME_ITEM,
  MATCHUP_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

/*
  generic function to addTimeItem
  must retrieve matchUp WITHOUT CONTEXT so original can be modified
*/
export function addTimeItem({ drawDefinition, matchUpId, timeItem }) {
  const { matchUp } = findMatchUp({ drawDefinition, matchUpId });

  if (!matchUp) return { error: MATCHUP_NOT_FOUND };

  const timeItemAttributes = timeItem && Object.keys(timeItem);
  const requiredAttributes = ['itemType', 'itemValue'];
  const validTimeItem =
    requiredAttributes.filter((attribute) =>
      timeItemAttributes.includes(attribute)
    ).length === requiredAttributes.length;

  if (!validTimeItem) return { error: INVALID_TIME_ITEM };

  if (!matchUp.timeItems) matchUp.timeItems = [];
  const createdAt = new Date().toISOString();
  Object.assign(timeItem, { createdAt });
  matchUp.timeItems.push(timeItem);

  return SUCCESS;
}

export function resetTimeItems({ drawDefinition, matchUpId }) {
  const { matchUp } = findMatchUp({ drawDefinition, matchUpId });
  if (!matchUp) return { error: MATCHUP_NOT_FOUND };
  matchUp.timeItems = [];
  return SUCCESS;
}
