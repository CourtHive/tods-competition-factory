import { SCALE } from '../../../constants/scaleConstants';
import { SUCCESS } from '../../../constants/resultConstants';

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

  if (!validScaleItem) return { error: 'Invalid Scale Item' };

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

  return modificationApplied ? SUCCESS : { error: 'Participant Not Found' };
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
    return modificationApplied
      ? SUCCESS
      : { error: 'No Modifications Applied' };
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
    return { error: 'Missing participant' };
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

  if (!validScaleItem) return { error: 'Invalid Scale Item' };

  const timeStamp = new Date().toISOString();
  if (!participant.timeItems) participant.timeItems = [];
  const timeItem = {
    itemSubject: SCALE,
    itemType: scaleItem.scaleType,
    itemClass: scaleItem.eventType,
    itemName: scaleItem.scaleName,
    itemValue: scaleItem.scaleValue,
    itemId: scaleItem.scaleId,
    itemDate: scaleItem.scaleDate,
    timeStamp,
  };
  participant.timeItems.push(timeItem);

  return SUCCESS;
}
