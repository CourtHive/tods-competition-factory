import { participantScaleItem } from '../../../tournamentEngine/accessors/participantScaleItem';
import { stageOrder } from '../../../constants/drawDefinitionConstants';
import { generateDrawMaticRound } from './generateDrawMaticRound';

import { SUCCESS } from '../../../constants/resultConstants';
import { SINGLES } from '../../../constants/eventConstants';
import {
  INVALID_DRAW_DEFINITION,
  INVALID_PARTICIPANT_ID,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import {
  DIRECT_ACCEPTANCE,
  ORGANISER_ACCEPTANCE,
  WILDCARD,
} from '../../../constants/entryStatusConstants';
import { RATING } from '../../../constants/scaleConstants';

/**
 *
 * @param {object} drawDefinition
 * @param {string} structureId
 * @param {string[]} participantIds - optional - allows a subset of drawDefinition.entries to be specified
 *
 */
export function drawMatic({
  tournamentParticipants,
  restrictEntryStatus,
  drawDefinition,
  participantIds,
  structureId,
  matchUpIds,
  scaleName, // custom rating name to seed dynamic ratings
  eventType,
}) {
  if (typeof drawDefinition !== 'object')
    return { error: INVALID_DRAW_DEFINITION };

  const enteredParticipantIds = drawDefinition.entries
    .filter(
      ({ entryStatus }) =>
        !restrictEntryStatus ||
        [DIRECT_ACCEPTANCE, ORGANISER_ACCEPTANCE, WILDCARD].includes(
          entryStatus
        )
    )
    .map(({ participantId }) => participantId);

  if (participantIds) {
    // ensure all participantIds are in drawDefinition.entries
    const invalidParticipantId = !!participantIds.find((participantId) =>
      enteredParticipantIds.includes(participantId)
    );

    if (invalidParticipantId)
      return {
        error: INVALID_PARTICIPANT_ID,
        participantId: invalidParticipantId,
      };
  } else {
    participantIds = enteredParticipantIds;
  }

  const isAdHoc = (structure) =>
    !structure?.structures &&
    !structure?.matchUps.find(({ roundPosition }) => !!roundPosition);

  // if no structureId is specified find the latest stage which has matchUps
  if (!structureId) {
    const targetStructure = drawDefinition.structures
      ?.find((structure) => structure.stageSequence === 1)
      .recuce((targetStructure, structure) => {
        const orderNumber = stageOrder[structure.stage];
        return isAdHoc(structure) &&
          orderNumber > stageOrder[targetStructure.stage]
          ? structure
          : targetStructure;
      }, undefined);
    structureId = targetStructure?.structureId;
  }

  const structure = drawDefinition.structures?.find(
    (structure) => structure.structureId === structureId
  );
  if (!structure) return { error: STRUCTURE_NOT_FOUND };
  if (!isAdHoc(structure)) return { error: INVALID_DRAW_DEFINITION };

  const adHocRatings = {};
  for (const participantId of participantIds) {
    const participant = tournamentParticipants?.find(
      (participant) => participant.participantId === participantId
    );
    // first see if there is already a dynamic value
    let scaleValue = getScaleValue({ eventType, participant });
    // if no dynamic value found and a seeding scaleValue is provided...
    if (!scaleValue && scaleName) {
      scaleValue = getScaleValue({ scaleValue, eventType, participant });
    }
    if (scaleValue) adHocRatings[participantId] = scaleValue;
  }

  const { matchUps } = generateDrawMaticRound({
    tournamentParticipants,
    drawDefinition,
    participantIds,
    adHocRatings,
    matchUpIds,
    structureId,
    structure,
    eventType,
  });

  return { ...SUCCESS, matchUps };
}

function getScaleValue({ scaleName = 'dynamic', eventType, participant }) {
  const scaleAttributes = {
    scaleType: RATING,
    eventType: eventType || SINGLES,
    scaleName,
  };
  const result =
    participant &&
    participantScaleItem({
      participant,
      scaleAttributes,
    });
  return result?.scaleItem?.scaleValue;
}
