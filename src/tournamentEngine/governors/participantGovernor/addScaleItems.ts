import { addDrawDefinitionTimeItem } from '../eventGovernor/drawDefinitions/addDrawDefinitionTimeItem';
import { participantScaleItem } from '../../../query/participant/participantScaleItem';
import { addNotice, getTopics } from '../../../global/state/globalState';
import { definedAttributes } from '../../../utilities/definedAttributes';
import { findEvent } from '../../../acquire/findEvent';
import {
  addEventTimeItem,
  addTournamentTimeItem,
} from '../tournamentGovernor/addTimeItem';

import { Participant, Tournament } from '../../../types/tournamentTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import { SCALE } from '../../../constants/scaleConstants';
import { ScaleItem } from '../../../types/factoryTypes';
import {
  INVALID_SCALE_ITEM,
  MISSING_PARTICIPANT,
  MISSING_PARTICIPANTS,
  MISSING_TOURNAMENT_RECORD,
  NO_MODIFICATIONS_APPLIED,
  PARTICIPANT_NOT_FOUND,
  VALUE_UNCHANGED,
} from '../../../constants/errorConditionConstants';
import {
  ADD_SCALE_ITEMS,
  AUDIT,
  MODIFY_PARTICIPANTS,
} from '../../../constants/topicConstants';

type SetParticipantScaleItemArgs = {
  tournamentRecord: Tournament;
  removePriorValues?: boolean;
  participantId: string;
  scaleItem?: ScaleItem;
};

export function setParticipantScaleItem(params: SetParticipantScaleItemArgs) {
  const { removePriorValues, tournamentRecord, participantId, scaleItem } =
    params;
  let equivalentValue, participant;

  if (!isValidScaleItem({ scaleItem })) return { error: INVALID_SCALE_ITEM };

  if (participantId && Array.isArray(tournamentRecord.participants)) {
    participant = tournamentRecord.participants.find(
      (participant) => participant.participantId === participantId
    );

    if (participant) {
      const result = addParticipantScaleItem({
        removePriorValues,
        participant,
        scaleItem,
      });
      if (result.error) return result;

      equivalentValue = !result.valueChanged;

      const { topics } = getTopics();
      if (topics.includes(MODIFY_PARTICIPANTS)) {
        addNotice({
          topic: MODIFY_PARTICIPANTS,
          payload: {
            tournamentId: tournamentRecord.tournamentId,
            participants: [participant],
          },
        });
      }
    }
  }

  return (
    (equivalentValue && {
      ...SUCCESS,
      info: VALUE_UNCHANGED,
      existingValue: scaleItem?.scaleValue,
    }) ||
    (participant && { ...SUCCESS, newValue: scaleItem?.scaleValue }) || {
      error: PARTICIPANT_NOT_FOUND,
    }
  );
}

type SetParticipantScaleItemsArgs = {
  scaleItemsWithParticipantIds: {
    scaleItems: ScaleItem[];
    participantId: string;
  }[];
  context?: { [key: string]: any };
  tournamentRecord: Tournament;
  removePriorValues?: boolean;
  auditData?: any;
};

export function setParticipantScaleItems(params: SetParticipantScaleItemsArgs) {
  const {
    scaleItemsWithParticipantIds = [],
    removePriorValues,
    tournamentRecord,
    auditData,
    context,
  } = params;

  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!tournamentRecord.participants) return { error: MISSING_PARTICIPANTS };

  let modificationsApplied = 0;
  const participantScaleItemsMap = {};

  const modifiedParticipants: Participant[] = [];

  for (const item of scaleItemsWithParticipantIds) {
    const participantId = item?.participantId;
    if (Array.isArray(item?.scaleItems)) {
      for (const scaleItem of item.scaleItems) {
        if (isValidScaleItem({ scaleItem })) {
          if (!Array.isArray(participantScaleItemsMap[participantId])) {
            participantScaleItemsMap[participantId] = [];
          }
          participantScaleItemsMap[participantId].push(scaleItem);
        } else {
          return { error: INVALID_SCALE_ITEM };
        }
      }
    }
  }

  tournamentRecord.participants.forEach((participant) => {
    const { participantId } = participant || {};
    if (Array.isArray(participantScaleItemsMap[participantId])) {
      participantScaleItemsMap[participantId].forEach((scaleItem) => {
        addParticipantScaleItem({ participant, scaleItem, removePriorValues });
        modifiedParticipants.push(participant);
        modificationsApplied++;
      });
    }
  });

  const info = !modificationsApplied ? NO_MODIFICATIONS_APPLIED : undefined;
  const { topics } = getTopics();
  if (topics.includes(MODIFY_PARTICIPANTS) && modificationsApplied) {
    addNotice({
      topic: MODIFY_PARTICIPANTS,
      payload: {
        tournamentId: tournamentRecord.tournamentId,
        participants: modifiedParticipants,
      },
    });
  }

  if (context) {
    const { eventId, drawId, ...itemValue } = context;
    const itemSubTypes = itemValue.scaleAttributes?.scaleType && [
      itemValue.scaleAttributes.scaleType,
    ];
    if (Object.keys(itemValue).length) {
      const timeItem: any = {
        itemType: ADD_SCALE_ITEMS,
        itemValue,
      };
      if (itemSubTypes) timeItem.itemSubTypes = itemSubTypes;

      if (drawId || eventId) {
        const { drawDefinition, event } = findEvent({
          tournamentRecord,
          eventId,
          drawId,
        });

        if (drawId) {
          addDrawDefinitionTimeItem({ drawDefinition, timeItem });
        }
        if (eventId) {
          addEventTimeItem({ event, timeItem });
        }
      } else {
        addTournamentTimeItem({ tournamentRecord, timeItem });
      }
    }
  }

  if (auditData && topics.includes(AUDIT)) {
    addNotice({ topic: AUDIT, payload: auditData });
  }

  return definedAttributes({ ...SUCCESS, modificationsApplied, info });
}

function isValidScaleItem({ scaleItem }) {
  const scaleItemAttributes = scaleItem && Object.keys(scaleItem);
  const requiredAttributes = ['scaleType', 'eventType', 'scaleName'];
  const validScaleItem =
    requiredAttributes.filter(
      (attribute) => scaleItemAttributes?.includes(attribute)
    ).length === requiredAttributes.length;
  return !!validScaleItem;
}

export function addParticipantScaleItem({
  removePriorValues,
  participant,
  scaleItem,
}) {
  if (!participant) {
    return { error: MISSING_PARTICIPANT };
  }

  const scaleItemAttributes = scaleItem && Object.keys(scaleItem);
  const requiredAttributes = ['scaleType', 'eventType', 'scaleName'];
  const validScaleItem =
    requiredAttributes.filter(
      (attribute) =>
        scaleItemAttributes.includes(attribute) && scaleItem[attribute]
    ).length === requiredAttributes.length;

  if (!validScaleItem) return { error: INVALID_SCALE_ITEM };

  const createdAt = new Date().toISOString();
  if (!participant.timeItems) participant.timeItems = [];

  const { scaleItem: existingScaleItem } = participantScaleItem({
    scaleAttributes: scaleItem,
    participant,
  });

  const isUndefined = (value) => [undefined, null, ''].includes(value);

  const valueChanged =
    !(
      isUndefined(existingScaleItem?.scaleValue) &&
      isUndefined(scaleItem.scaleValue)
    ) &&
    JSON.stringify(existingScaleItem?.scaleValue) !==
      JSON.stringify(scaleItem.scaleValue);

  if (valueChanged) {
    const { scaleType, eventType, scaleName } = scaleItem;
    const itemType = [SCALE, scaleType, eventType, scaleName].join('.');

    const timeItem = definedAttributes({
      itemValue: scaleItem.scaleValue,
      itemDate: scaleItem.scaleDate,
      createdAt,
      itemType,
    });

    // if there is a unique identifier for the scale
    if (scaleItem.scaleId) {
      timeItem.itemSubTypes = [scaleItem.scaleId];
    }

    if (removePriorValues) {
      participant.timeItems = participant.timeItems.filter(
        (timeItem) => timeItem.itemType !== itemType
      );
    }

    participant.timeItems.push(timeItem);
  }

  return { ...SUCCESS, valueChanged, newValue: scaleItem.scaleValue };
}
