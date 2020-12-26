import {
  MISSING_DRAW_ID,
  MISSING_EVENT,
  MISSING_TIME_ITEMS,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
  NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function getDrawDefinitionTimeItem({
  drawDefinition,
  itemType,
  itemSubTypes,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_ID };
  if (!drawDefinition.timeItems) return { message: NOT_FOUND };

  const { timeItem, message } = getTimeItem({
    element: drawDefinition,
    itemType,
    itemSubTypes,
  });
  return (timeItem && { timeItem }) || { message };
}

export function getEventTimeItem({ event, itemType, itemSubTypes }) {
  if (!event) return { error: MISSING_EVENT };
  if (!event.timeItems) return { message: NOT_FOUND };

  const { timeItem, message } = getTimeItem({
    element: event,
    itemType,
    itemSubTypes,
  });
  return (timeItem && { timeItem }) || { message };
}

export function getTournamentTimeItem({
  tournamentRecord,
  itemType,
  itemSubTypes,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!tournamentRecord.timeItems) return { message: NOT_FOUND };

  const { timeItem, message } = getTimeItem({
    element: tournamentRecord,
    itemType,
    itemSubTypes,
  });
  return (timeItem && { timeItem }) || { message };
}

function getTimeItem({ element, itemType, itemSubTypes }) {
  if (!element) return { error: MISSING_VALUE };
  if (!Array.isArray(element.timeItems)) return { error: MISSING_TIME_ITEMS };

  const filteredSorted = element.timeItems
    .filter((timeItem) => timeItem.itemType === itemType)
    .filter(
      (timeItem) =>
        !itemSubTypes || timeItem?.itemSubTypes?.includes(itemSubTypes)
    )
    .sort(
      (a, b) =>
        new Date(a.createdAt || undefined) - new Date(b.createdAt || undefined)
    );

  const timeItem = filteredSorted.pop();

  if (timeItem) {
    return { timeItem, ...SUCCESS };
  } else {
    return { message: NOT_FOUND };
  }
}
