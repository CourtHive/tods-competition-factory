import { participantScaleItem } from '../../accessors/participantScaleItem';
import { addNotice, getTopics } from '../../../global/globalState';

import { MODIFY_PARTICIPANTS } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { SCALE } from '../../../constants/scaleConstants';
import {
  INVALID_SCALE_ITEM,
  MISSING_PARTICIPANT,
  MISSING_PARTICIPANTS,
  MISSING_TOURNAMENT_RECORD,
  NO_MODIFICATIONS_APPLIED,
  PARTICIPANT_NOT_FOUND,
  VALUE_UNCHANGED,
} from '../../../constants/errorConditionConstants';

export function setParticipantScaleItem({
  tournamentRecord,
  participantId,
  scaleItem,
}) {
  let equivalentValue, participant;

  const scaleItemAttributes = (scaleItem && Object.keys(scaleItem)) || [];
  const requiredAttributes = ['scaleType', 'eventType', 'scaleName'];
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
    participant = tournamentRecord.participants.find(
      (participant) => participant.participantId === participantId
    );

    if (participant) {
      const { newValue, error } = addParticipantScaleItem({
        participant,
        scaleItem,
      });
      if (error) return { error };

      equivalentValue = scaleItem.scaleValue === newValue;

      const { topics } = getTopics();
      if (topics.includes(MODIFY_PARTICIPANTS)) {
        addNotice({
          topic: MODIFY_PARTICIPANTS,
          payload: { participants: [participant] },
        });
      }
    }
  }

  return equivalentValue
    ? { ...SUCCESS, message: VALUE_UNCHANGED, value: scaleItem.scaleValue }
    : participant
    ? { ...SUCCESS, value: scaleItem.scaleValue }
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
  const modifiedParticipants = [];
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
        modifiedParticipants.push(participant);
        modificationsApplied++;
      });
    }
  });

  const message = !modificationsApplied && NO_MODIFICATIONS_APPLIED;

  const { topics } = getTopics();
  if (
    topics.includes(MODIFY_PARTICIPANTS) &&
    modificationsApplied &&
    !errors.length
  ) {
    addNotice({
      topic: MODIFY_PARTICIPANTS,
      payload: { participants: modifiedParticipants },
    });
  }

  return errors.length
    ? { error: errors }
    : Object.assign({}, SUCCESS, { modificationsApplied, message });
}

function isValidScaleItem({ scaleItem }) {
  const scaleItemAttributes = scaleItem && Object.keys(scaleItem);
  const requiredAttributes = ['scaleType', 'eventType', 'scaleName'];
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
  const requiredAttributes = ['scaleType', 'eventType', 'scaleName'];
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
  const valueChanged =
    (!existingScaleItem && scaleItem.scaleValue) ||
    existingScaleItem?.scaleValue !== scaleItem.scaleValue;

  if (valueChanged) {
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

  return Object.assign({ newValue: scaleItem.scaleValue }, SUCCESS);
}
