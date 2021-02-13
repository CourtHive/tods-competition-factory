import { findTournamentParticipant } from '../../getters/participants/participantGetter';

import {
  MISSING_DRAW_ID,
  MISSING_EVENT,
  MISSING_PARTICIPANT_ID,
  MISSING_TIME_ITEMS,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
  NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function getTimeItem({
  element,
  itemType,
  itemSubTypes,
  returnPreviousValues,
}) {
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
    const result = { timeItem, ...SUCCESS };
    if (returnPreviousValues)
      Object.assign(result, { previousItems: filteredSorted });
    return result;
  } else {
    return { message: NOT_FOUND };
  }
}

export function getDrawDefinitionTimeItem({
  drawDefinition,
  itemType,
  itemSubTypes,
  returnPreviousValues,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_ID };
  if (!drawDefinition.timeItems) return { message: NOT_FOUND };

  const { timeItem, previousItems, message } = getTimeItem({
    element: drawDefinition,
    itemType,
    itemSubTypes,
    returnPreviousValues,
  });
  return (timeItem && { timeItem, previousItems }) || { message };
}

export function getEventTimeItem({
  event,
  itemType,
  itemSubTypes,
  returnPreviousValues,
}) {
  if (!event) return { error: MISSING_EVENT };
  if (!event.timeItems) return { message: NOT_FOUND };

  const { timeItem, previousItems, message } = getTimeItem({
    element: event,
    itemType,
    itemSubTypes,
    returnPreviousValues,
  });
  return (timeItem && { timeItem, previousItems }) || { message };
}

export function getTournamentTimeItem({
  tournamentRecord,
  itemType,
  itemSubTypes,
  returnPreviousValues,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!tournamentRecord.timeItems) return { message: NOT_FOUND };

  const { timeItem, previousItems, message } = getTimeItem({
    element: tournamentRecord,
    itemType,
    itemSubTypes,
    returnPreviousValues,
  });
  return (timeItem && { timeItem, previousItems }) || { message };
}

export function getParticipantTimeItem({
  tournamentRecord,
  participantId,
  itemType,
  itemSubTypes,
  returnPreviousValues,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  const result = findTournamentParticipant({ tournamentRecord, participantId });
  if (result.error) return result;

  const { participant } = result;
  if (!participant?.timeItems) return { message: NOT_FOUND };

  const { timeItem, previousItems, message } = getTimeItem({
    element: result.participant,
    itemType,
    itemSubTypes,
    returnPreviousValues,
  });

  return (timeItem && { timeItem, previousItems }) || { message };
}
