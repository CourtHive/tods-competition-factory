import { findTournamentParticipant } from '../../getters/participants/participantGetter';
import { getTimeItem } from '../queryGovernor/timeItems';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  EVENT_NOT_FOUND,
  INVALID_TIME_ITEM,
  MISSING_PARTICIPANT_ID,
  MISSING_TIME_ITEM,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function addTimeItem({
  duplicateValues = true,
  removePriorValues,
  timeItem,
  element,
}) {
  if (!timeItem) return { error: MISSING_TIME_ITEM };
  if (!element) return { error: MISSING_VALUE };

  const timeItemAttributes = timeItem && Object.keys(timeItem);
  const requiredAttributes = ['itemType', 'itemValue'];
  const validTimeItem =
    requiredAttributes.filter((attribute) =>
      timeItemAttributes.includes(attribute)
    ).length === requiredAttributes.length;

  if (!validTimeItem) return { error: INVALID_TIME_ITEM };

  if (!element.timeItems) {
    element.timeItems = [];
  } else {
    // check if timeItem with equivalent value already exists
    const { itemType, itemSubTypes, itemValue } = timeItem;
    const { timeItem: existingTimeItem } = getTimeItem({
      itemSubTypes,
      itemType,
      element,
    });
    if (
      JSON.stringify(existingTimeItem?.itemValue) ===
        JSON.stringify(itemValue) &&
      !duplicateValues
    ) {
      return { ...SUCCESS };
    }
  }

  if (timeItem.itemSubTypes && !timeItem.itemSubTypes.length) {
    delete timeItem.itemSubTypes;
  }

  const createdAt = new Date().toISOString();
  Object.assign(timeItem, { createdAt });

  if (removePriorValues) {
    element.timeItems = element.timeItems.filter(
      ({ itemType }) => timeItem.itemType !== itemType
    );
  }

  element.timeItems.push(timeItem);

  return { ...SUCCESS };
}

export function addParticipantTimeItem({
  removePriorValues,
  tournamentRecord,
  duplicateValues,
  participantId,
  timeItem,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  const result = findTournamentParticipant({ tournamentRecord, participantId });
  if (result.error) return result;

  return addTimeItem({
    element: result.participant,
    removePriorValues,
    duplicateValues,
    timeItem,
  });
}

export function addTournamentTimeItem({
  removePriorValues,
  tournamentRecord,
  duplicateValues,
  timeItem,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  return addTimeItem({
    element: tournamentRecord,
    removePriorValues,
    duplicateValues,
    timeItem,
  });
}

export function addEventTimeItem({
  event,
  timeItem,
  duplicateValues,
  removePriorValues,
}) {
  if (!event) return { error: EVENT_NOT_FOUND };
  return addTimeItem({
    removePriorValues,
    duplicateValues,
    element: event,
    timeItem,
  });
}

export function resetTimeItems({ element }) {
  if (!element) return { error: MISSING_VALUE };
  element.timeItems = [];
  return { ...SUCCESS };
}
