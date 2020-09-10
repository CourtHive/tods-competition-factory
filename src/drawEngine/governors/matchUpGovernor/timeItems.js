import { findMatchUp } from '../../getters/getMatchUps';
import { SUCCESS } from '../../../constants/resultConstants';

/*
  generic function to addTimeItem
  must retrieve matchUp WITHOUT CONTEXT so original can be modified
*/
export function addTimeItem({ drawDefinition, matchUpId, timeItem }) {
  const { matchUp } = findMatchUp({ drawDefinition, matchUpId });

  if (!matchUp) return { error: 'MatchUp Not Found' };

  const timeItemAttributes = timeItem && Object.keys(timeItem);
  const requiredAttributes = ['itemSubject', 'itemValue'];
  const validTimeItem =
    requiredAttributes.filter(attribute =>
      timeItemAttributes.includes(attribute)
    ).length === requiredAttributes.length;

  if (!validTimeItem) return { error: 'Invalid Time Item' };

  if (!matchUp.timeItems) matchUp.timeItems = [];
  const timeStamp = new Date().toISOString();
  Object.assign(timeItem, { timeStamp });
  matchUp.timeItems.push(timeItem);

  return SUCCESS;
}

export function resetTimeItems({ drawDefinition, matchUpId }) {
  const { matchUp } = findMatchUp({ drawDefinition, matchUpId });
  if (!matchUp) return { error: 'MatchUp Not Found' };
  matchUp.timeItems = [];
  return SUCCESS;
}
