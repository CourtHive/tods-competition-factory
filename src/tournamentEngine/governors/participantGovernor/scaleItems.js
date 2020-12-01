import { SCALE } from '../../../constants/scaleConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_SCALE_ITEM,
  MISSING_PARTICIPANT,
  NO_MODIFICATIONS_APPLIED,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function setParticipantScaleItem({
  tournamentRecord,
  participantId,
  scaleItem,
}) {
  let modificationApplied;

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
        addParticipantScaleItem({ participant, scaleItem });
        modificationApplied = true;
      }
    });
  }

  return modificationApplied ? SUCCESS : { error: PARTICIPANT_NOT_FOUND };
}

export function setParticipantScaleItems({
  tournamentRecord,
  scaleItemsWithParticipantIDsArray,
}) {
  let modificationApplied;
  const participantScaleItemsMap = {};

  if (tournamentRecord && tournamentRecord.participants) {
    scaleItemsWithParticipantIDsArray.forEach(item => {
      const participantId = item && item.participantId;
      if (item && Array.isArray(item.scaleItems)) {
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

  const timeStamp = new Date().toISOString();
  if (!participant.timeItems) participant.timeItems = [];
  const timeItem = {
    itemSubject: SCALE,
    itemType: scaleItem.scaleType,
    itemSubType: scaleItem.eventType,
    itemName: scaleItem.scaleName,
    itemValue: scaleItem.scaleValue,
    itemId: scaleItem.scaleId,
    itemDate: scaleItem.scaleDate,
    timeStamp,
  };
  participant.timeItems.push(timeItem);

  return SUCCESS;
}
