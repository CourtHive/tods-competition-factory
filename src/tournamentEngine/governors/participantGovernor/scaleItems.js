import { SCALE } from '../../../constants/scaleConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_SCALE_ITEM,
  MISSING_PARTICIPANT,
  MISSING_PARTICIPANTS,
  MISSING_TOURNAMENT_RECORD,
  NO_MODIFICATIONS_APPLIED,
  PARTICIPANT_NOT_FOUND,
  VALUE_UNCHANGED,
} from '../../../constants/errorConditionConstants';
import { participantScaleItem } from '../../accessors/participantScaleItem';

export function setParticipantScaleItem({
  tournamentRecord,
  participantId,
  scaleItem,
}) {
  let modificationApplied, equivalentValue, participantFound;

  const scaleItemAttributes = scaleItem && Object.keys(scaleItem);
  const requiredAttributes = [
    'scaleType',
    'eventType',
    'scaleName',
    'scaleValue',
  ];
  const validScaleItem =
    requiredAttributes.filter((attribute) =>
      scaleItemAttributes.includes(attribute)
    ).length === requiredAttributes.length;

  if (!validScaleItem) return { error: INVALID_SCALE_ITEM };

  if (
    participantId &&
    validScaleItem &&
    Array.isArray(tournamentRecord.participants)
  ) {
    tournamentRecord.participants.forEach((participant) => {
      if (participant.participantId === participantId) {
        participantFound = true;
        const { success, newValue, error } = addParticipantScaleItem({
          participant,
          scaleItem,
        });
        if (error) return { error };

        modificationApplied = success;
        equivalentValue = scaleItem.scaleValue === newValue;
      }
    });
  }

  return modificationApplied && equivalentValue
    ? { ...SUCCESS, value: scaleItem.scaleValue }
    : participantFound
    ? { ...SUCCESS, message: VALUE_UNCHANGED, value: scaleItem.scaleValue }
    : { error: PARTICIPANT_NOT_FOUND };
}

export function setParticipantScaleItems({
  tournamentRecord,
  scaleItemsWithParticipantIds = [],
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!tournamentRecord.participants) return { error: MISSING_PARTICIPANTS };

  let modificationsApplied = 0;
  const participantScaleItemsMap = {};

  const errors = [];
  scaleItemsWithParticipantIds.forEach((item) => {
    const participantId = item?.participantId;
    if (Array.isArray(item?.scaleItems)) {
      item.scaleItems.forEach((scaleItem) => {
        if (isValidScaleItem({ scaleItem })) {
          if (!Array.isArray(participantScaleItemsMap[participantId])) {
            participantScaleItemsMap[participantId] = [];
          }
          participantScaleItemsMap[participantId].push(scaleItem);
        } else {
          errors.push({ error: INVALID_SCALE_ITEM });
        }
      });
    }
  });

  tournamentRecord.participants.forEach((participant) => {
    const { participantId } = participant || {};
    if (Array.isArray(participantScaleItemsMap[participantId])) {
      participantScaleItemsMap[participantId].forEach((scaleItem) => {
        addParticipantScaleItem({ participant, scaleItem });
        modificationsApplied++;
      });
    }
  });

  const message = !modificationsApplied && NO_MODIFICATIONS_APPLIED;

  return errors.length
    ? { error: errors }
    : Object.assign({}, SUCCESS, { modificationsApplied, message });
}

function isValidScaleItem({ scaleItem }) {
  const scaleItemAttributes = scaleItem && Object.keys(scaleItem);
  const requiredAttributes = [
    'scaleType',
    'eventType',
    'scaleName',
    'scaleValue',
  ];
  const validScaleItem =
    requiredAttributes.filter((attribute) =>
      scaleItemAttributes.includes(attribute)
    ).length === requiredAttributes.length;
  return !!validScaleItem;
}

export function addParticipantScaleItem({ participant, scaleItem }) {
  if (!participant) {
    return { error: MISSING_PARTICIPANT };
  }

  const scaleItemAttributes = scaleItem && Object.keys(scaleItem);
  const requiredAttributes = [
    'scaleType',
    'eventType',
    'scaleName',
    'scaleValue',
  ];
  const validScaleItem =
    requiredAttributes.filter((attribute) =>
      scaleItemAttributes.includes(attribute)
    ).length === requiredAttributes.length;

  if (!validScaleItem) return { error: INVALID_SCALE_ITEM };

  const createdAt = new Date().toISOString();
  if (!participant.timeItems) participant.timeItems = [];

  const { scaleItem: existingScaleItem } = participantScaleItem({
    participant,
    scaleAttributes: scaleItem,
  });
  const noChange =
    (!existingScaleItem && !scaleItem.scaleValue) ||
    existingScaleItem?.scaleValue === scaleItem.scaleValue;
  const newValue = !noChange;

  if (newValue) {
    const { scaleType, eventType, scaleName } = scaleItem;
    const itemType = [SCALE, scaleType, eventType, scaleName].join('.');

    const timeItem = {
      itemType,
      itemValue: scaleItem.scaleValue,
      itemDate: scaleItem.scaleDate,
      createdAt,
    };
    if (scaleItem.scaleId) {
      timeItem.itemSubTypes = [scaleItem.scaleId];
    }
    participant.timeItems.push(timeItem);
  }

  return Object.assign({ newValue }, SUCCESS);
}
