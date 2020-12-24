import {
  EVENT_NOT_FOUND,
  INVALID_TIME_ITEM,
  MISSING_TIME_ITEM,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function addTimeItem({ element, timeItem }) {
  if (!element) return { error: MISSING_VALUE };
  if (!timeItem) return { error: MISSING_TIME_ITEM };

  const timeItemAttributes = timeItem && Object.keys(timeItem);
  const requiredAttributes = ['itemType', 'itemValue'];
  const validTimeItem =
    requiredAttributes.filter((attribute) =>
      timeItemAttributes.includes(attribute)
    ).length === requiredAttributes.length;

  if (!validTimeItem) return { error: INVALID_TIME_ITEM };

  if (!element.timeItems) element.timeItems = [];
  const createdAt = new Date().toISOString();
  Object.assign(timeItem, { createdAt });
  element.timeItems.push(timeItem);

  return SUCCESS;
}

export function addTournamentTimeItem({ tournamentRecord, timeItem }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  return addTimeItem({ element: tournamentRecord, timeItem });
}

export function addEventTimeItem({ event, timeItem }) {
  if (!event) return { error: EVENT_NOT_FOUND };
  return addTimeItem({ element: event, timeItem });
}

export function resetTimeItems({ element }) {
  if (!element) return { error: MISSING_VALUE };
  element.timeItems = [];
  return SUCCESS;
}
