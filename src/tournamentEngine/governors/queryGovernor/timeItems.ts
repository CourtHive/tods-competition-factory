import { findTournamentParticipant } from '../../getters/participants/participantGetter';

import { ResultType } from '../../../global/functions/decorateResult';
import { ELEMENT_REQUIRED } from '../../../constants/infoConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_DRAW_ID,
  MISSING_EVENT,
  MISSING_PARTICIPANT_ID,
  MISSING_TIME_ITEMS,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
  NOT_FOUND,
} from '../../../constants/errorConditionConstants';

type TimeItemResult = {
  timeItem?: { name: string; value: any };
  previousItems?: any;
  success?: boolean;
  code?: string;
  info?: any;
};

type TimeItemArgs = {
  returnPreviousValues?: boolean;
  itemSubTypes?: string[];
  itemType: string;
  element: any;
};

export function getTimeItem({
  returnPreviousValues,
  itemSubTypes,
  itemType,
  element,
}: TimeItemArgs): TimeItemResult | ResultType {
  if (!element) return { error: MISSING_VALUE, info: ELEMENT_REQUIRED };
  if (itemSubTypes && !Array.isArray(itemSubTypes))
    return { error: INVALID_VALUES, context: { itemSubTypes } };
  if (!Array.isArray(element.timeItems)) return { error: MISSING_TIME_ITEMS };

  const filteredSorted = element.timeItems
    .filter((timeItem) => timeItem?.itemType === itemType)
    .filter(
      (timeItem) =>
        !itemSubTypes?.length ||
        itemSubTypes.some(
          (subType) => timeItem?.itemSubTypes?.includes(subType)
        )
    )
    .sort((a, b) => {
      const aDate = new Date(a.createdAt || undefined).getTime();
      const bDate = new Date(b.createdAt || undefined).getTime();
      return aDate - bDate;
    });

  const timeItem = filteredSorted.pop();

  if (timeItem) {
    const result = { timeItem, ...SUCCESS };
    if (returnPreviousValues)
      Object.assign(result, { previousItems: filteredSorted });
    return result;
  } else {
    return { info: NOT_FOUND };
  }
}

export function getDrawDefinitionTimeItem({
  returnPreviousValues,
  drawDefinition,
  itemSubTypes,
  itemType,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_ID };
  if (!drawDefinition.timeItems) return { info: NOT_FOUND };

  const { timeItem, previousItems, info } = getTimeItem({
    element: drawDefinition,
    returnPreviousValues,
    itemSubTypes,
    itemType,
  });
  return (timeItem && { timeItem, previousItems }) || { info };
}

export function getEventTimeItem({
  returnPreviousValues,
  itemSubTypes,
  itemType,
  event,
}) {
  if (!event) return { error: MISSING_EVENT };
  if (!event.timeItems) return { info: NOT_FOUND };

  const { timeItem, previousItems, info } = getTimeItem({
    returnPreviousValues,
    element: event,
    itemSubTypes,
    itemType,
  });
  return (timeItem && { timeItem, previousItems }) || { info };
}

export function getTournamentTimeItem({
  returnPreviousValues,
  tournamentRecord,
  itemSubTypes,
  itemType,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!tournamentRecord.timeItems) return { info: NOT_FOUND };

  const { timeItem, previousItems, info } = getTimeItem({
    element: tournamentRecord,
    returnPreviousValues,
    itemSubTypes,
    itemType,
  });
  return (timeItem && { timeItem, previousItems }) || { info };
}

export function getParticipantTimeItem({
  returnPreviousValues,
  tournamentRecord,
  participantId,
  itemSubTypes,
  itemType,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  const result = findTournamentParticipant({ tournamentRecord, participantId });
  if (result.error) return result;

  const { participant } = result;
  if (!participant?.timeItems) return { info: NOT_FOUND };

  const { timeItem, previousItems, info } = getTimeItem({
    element: result.participant,
    returnPreviousValues,
    itemSubTypes,
    itemType,
  });

  return (timeItem && { timeItem, previousItems }) || { info };
}
