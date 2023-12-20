import { findTournamentParticipant } from '../../tournamentEngine/getters/participants/participantGetter';
import { getTimeItem } from '../../tournamentEngine/governors/queryGovernor/timeItems';

import { TimeItem, Tournament } from '../../types/tournamentTypes';
import { ELEMENT_REQUIRED } from '../../constants/infoConstants';
import { SUCCESS } from '../../constants/resultConstants';
import {
  EVENT_NOT_FOUND,
  INVALID_TIME_ITEM,
  MISSING_PARTICIPANT_ID,
  MISSING_TIME_ITEM,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../constants/errorConditionConstants';

type AddTimeItemArgs = {
  removePriorValues?: boolean;
  duplicateValues?: boolean;
  creationTime?: boolean;
  timeItem: TimeItem;
  element: any;
};
export function addTimeItem(params: AddTimeItemArgs) {
  const {
    duplicateValues = true,
    creationTime = true,
    removePriorValues,
    timeItem,
    element,
  } = params;
  if (!timeItem) return { error: MISSING_TIME_ITEM };
  if (!element) return { error: MISSING_VALUE, info: ELEMENT_REQUIRED };

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
    const existingTimeItem =
      itemType &&
      getTimeItem({
        itemSubTypes,
        itemType,
        element,
      })?.timeItem;
    if (
      existingTimeItem &&
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

  if (creationTime) {
    const createdAt = new Date().toISOString();
    Object.assign(timeItem, { createdAt });
  }

  if (removePriorValues) {
    element.timeItems = element.timeItems.filter(
      ({ itemType }) => timeItem.itemType !== itemType
    );
  }

  // if priorValues are being remvoed and there is no new itemValue, do not add by pushing
  const doNotAdd = removePriorValues && !timeItem.itemValue;
  if (!doNotAdd) {
    element.timeItems.push(timeItem);
  }

  return { ...SUCCESS };
}

type AddParticipantTimeItemArgs = {
  tournamentRecord: Tournament;
  removePriorValues?: boolean;
  duplicateValues?: boolean;
  creationTime?: boolean;
  participantId: string;
  timeItem: TimeItem;
};
export function addParticipantTimeItem({
  creationTime = true,
  removePriorValues,
  tournamentRecord,
  duplicateValues,
  participantId,
  timeItem,
}: AddParticipantTimeItemArgs) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  const result = findTournamentParticipant({ tournamentRecord, participantId });
  if (result.error) return result;

  return addTimeItem({
    element: result.participant,
    removePriorValues,
    duplicateValues,
    creationTime,
    timeItem,
  });
}

export function addTournamentTimeItem(params) {
  const {
    removePriorValues,
    tournamentRecord,
    duplicateValues,
    creationTime,
    timeItem,
  } = params;
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  return addTimeItem({
    element: tournamentRecord,
    removePriorValues,
    duplicateValues,
    creationTime,
    timeItem,
  });
}

export function addEventTimeItem(params) {
  const { removePriorValues, duplicateValues, creationTime, timeItem, event } =
    params;
  if (!event) return { error: EVENT_NOT_FOUND };
  return addTimeItem({
    removePriorValues,
    duplicateValues,
    element: event,
    creationTime,
    timeItem,
  });
}

export function resetTimeItems({ element }) {
  if (!element) return { error: MISSING_VALUE };
  element.timeItems = [];
  return { ...SUCCESS };
}
