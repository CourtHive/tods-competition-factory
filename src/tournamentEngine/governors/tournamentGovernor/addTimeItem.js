import { findTournamentParticipant } from '../../getters/participants/participantGetter';
import { getTimeItem } from '../queryGovernor/timeItems';

import {
  EVENT_NOT_FOUND,
  INVALID_TIME_ITEM,
  MISSING_PARTICIPANT_ID,
  MISSING_TIME_ITEM,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function addTimeItem({ element, timeItem, duplicateValues = true }) {
  if (!element) return { error: MISSING_VALUE };
  if (!timeItem) return { error: MISSING_TIME_ITEM };

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
      element,
      itemType,
      itemSubTypes,
    });
    if (existingTimeItem?.itemValue === itemValue && !duplicateValues) {
      return SUCCESS;
    }
  }

  const createdAt = new Date().toISOString();
  Object.assign(timeItem, { createdAt });
  element.timeItems.push(timeItem);

  return SUCCESS;
}

export function addParticipantTimeItem({
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
    duplicateValues,
    timeItem,
  });
}

export function addTournamentTimeItem({
  tournamentRecord,
  duplicateValues,
  timeItem,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  return addTimeItem({ element: tournamentRecord, timeItem, duplicateValues });
}

export function addEventTimeItem({ event, timeItem, duplicateValues }) {
  if (!event) return { error: EVENT_NOT_FOUND };
  return addTimeItem({ element: event, timeItem, duplicateValues });
}

export function resetTimeItems({ element }) {
  if (!element) return { error: MISSING_VALUE };
  element.timeItems = [];
  return SUCCESS;
}
