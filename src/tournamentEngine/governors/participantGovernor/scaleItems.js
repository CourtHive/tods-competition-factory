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
  let modificationApplied, participantFound;

  const scaleItemAttributes = scaleItem && Object.keys(scaleItem);
  const requiredAttributes = [
    'scaleType',
    'eventType',
    'scaleName',
    'scaleValue',
  ];
  const validScaleItem =
    requiredAttributes.filter(attribute =>
      scaleItemAttributes.includes(attribute)
    ).length === requiredAttributes.length;

  if (!validScaleItem) return { error: INVALID_SCALE_ITEM };

  if (
    participantId &&
    validScaleItem &&
    Array.isArray(tournamentRecord.participants)
  ) {
    tournamentRecord.participants.forEach(participant => {
      if (participant.participantId === participantId) {
        participantFound = true;
        const { scaleItem: existingScaleItem } = participantScaleItem({
          participant,
          scaleAttributes: scaleItem,
        });
        const noChange =
          (!existingScaleItem && !scaleItem.scaleValue) ||
          existingScaleItem?.scaleValue === scaleItem.scaleValue;
        const newValue = !noChange;
        if (newValue) {
          const result = addParticipantScaleItem({ participant, scaleItem });
          modificationApplied = !!result.success;
        }
      }
    });
  }

  return modificationApplied
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

  let modificationApplied;
  const participantScaleItemsMap = {};

  scaleItemsWithParticipantIds.forEach(item => {
    const participantId = item?.participantId;
    if (Array.isArray(item?.scaleItems)) {
      item.scaleItems.forEach(scaleItem => {
        if (isValidScaleItem({ scaleItem })) {
          if (!Array.isArray(participantScaleItemsMap[participantId])) {
            participantScaleItemsMap[participantId] = [];
          }
          participantScaleItemsMap[participantId].push(scaleItem);
        }
      });
    }
  });

  tournamentRecord.participants.forEach(participant => {
    const { participantId } = participant || {};
    if (Array.isArray(participantScaleItemsMap[participantId])) {
      participantScaleItemsMap[participantId].forEach(scaleItem => {
        addParticipantScaleItem({ participant, scaleItem });
        modificationApplied = true;
      });
    }
  });

  return modificationApplied ? SUCCESS : { error: NO_MODIFICATIONS_APPLIED };
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
    requiredAttributes.filter(attribute =>
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
    requiredAttributes.filter(attribute =>
      scaleItemAttributes.includes(attribute)
    ).length === requiredAttributes.length;

  if (!validScaleItem) return { error: INVALID_SCALE_ITEM };

  const createdAt = new Date().toISOString();
  if (!participant.timeItems) participant.timeItems = [];
  const timeItem = {
    itemSubject: SCALE,
    itemType: scaleItem.scaleType,
    itemSubType: scaleItem.eventType,
    itemName: scaleItem.scaleName,
    itemValue: scaleItem.scaleValue,
    itemId: scaleItem.scaleId,
    itemDate: scaleItem.scaleDate,
    createdAt,
  };
  participant.timeItems.push(timeItem);

  return SUCCESS;
}
