import {
  MISSING_DRAW_ID,
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
  NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function getDrawDefinitionTimeItem({ drawDefinition, itemAttributes }) {
  if (!drawDefinition) return { error: MISSING_DRAW_ID };
  if (!drawDefinition.timeItems) return { message: NOT_FOUND };

  const { timeItem, message } = getTimeItem({
    element: drawDefinition,
    itemAttributes,
  });
  return (timeItem && { timeItem }) || { message };
}

export function getEventTimeItem({ event, itemAttributes }) {
  if (!event) return { error: MISSING_EVENT };
  if (!event.timeItems) return { message: NOT_FOUND };

  const { timeItem, message } = getTimeItem({ element: event, itemAttributes });
  return (timeItem && { timeItem }) || { message };
}

export function getTournamentTimeItem({ tournamentRecord, itemAttributes }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!tournamentRecord.timeItems) return { message: NOT_FOUND };

  const { timeItem, message } = getTimeItem({
    element: tournamentRecord,
    itemAttributes,
  });
  return (timeItem && { timeItem }) || { message };
}

function getTimeItem({ element, itemAttributes }) {
  if (element && Array.isArray(element.timeItems)) {
    const timeItem = element.timeItems
      .filter(
        (timeItem) =>
          !itemAttributes?.itemSubject ||
          timeItem?.itemSubject === itemAttributes?.itemSubject
      )
      .filter(
        (timeItem) =>
          !itemAttributes?.itemType ||
          timeItem?.itemType === itemAttributes?.itemType
      )
      .filter(
        (timeItem) =>
          !itemAttributes?.itemSubType ||
          timeItem?.itemSubType === itemAttributes?.itemSubType
      )
      .sort(
        (a, b) =>
          new Date(a.createdAt || undefined) -
          new Date(b.createdAt || undefined)
      )
      .reduce((timeItem, candidate) => {
        return (candidate.itemName === itemAttributes?.itemName &&
          (!itemAttributes?.itemType ||
            candidate?.itemType === itemAttributes?.itemType) &&
          (!itemAttributes?.itemClass ||
            candidate?.itemSubType === itemAttributes?.itemClass)) ||
          (candidate?.itemId &&
            itemAttributes?.itemId &&
            candidate?.itemId === itemAttributes?.itemId)
          ? candidate
          : timeItem;
      }, undefined);

    if (timeItem) {
      return { timeItem, ...SUCCESS };
    } else {
      return { message: NOT_FOUND };
    }
  }
}
