import {
  INVALID_TIME_ITEM,
  MATCHUP_NOT_FOUND,
  MISSING_TIME_ITEM,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function addEventTimeItem({ event, timeItem }) {
  if (!event) return { error: EVENT_NOT_FOUND };
  if (!timeItem) return { error: MISSING_TIME_ITEM };

  const timeItemAttributes = timeItem && Object.keys(timeItem);
  const requiredAttributes = ['itemType', 'itemValue'];
  const validTimeItem =
    requiredAttributes.filter(attribute =>
      timeItemAttributes.includes(attribute)
    ).length === requiredAttributes.length;

  if (!validTimeItem) return { error: INVALID_TIME_ITEM };

  if (!event.timeItems) event.timeItems = [];
  const createdAt = new Date().toISOString();
  Object.assign(timeItem, { createdAt });
  event.timeItems.push(timeItem);

  return SUCCESS;
}

export function resetTimeItems({ event }) {
  if (!event) return { error: EVENT_NOT_FOUND };
  event.timeItems = [];
  return SUCCESS;
}
