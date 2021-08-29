import { stageOrder } from '../../../constants/drawDefinitionConstants';
import { generateDrawMaticRound } from './generateDrawMaticRound';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_DRAW_DEFINITION,
  INVALID_PARTICIPANT_ID,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

/**
 *
 * @param {object} drawDefinition
 * @param {string} structureId
 * @param {string[]} participantIds - optional - allows a subset of drawDefinition.entries to be specified
 *
 */
export function drawMatic({
  tournamentParticipants,
  drawDefinition,
  participantIds,
  structureId,
  matchUpIds,
  eventType,
}) {
  if (typeof drawDefinition !== 'object')
    return { error: INVALID_DRAW_DEFINITION };

  const enteredParticipantIds = drawDefinition.entries.map(
    ({ participantId }) => participantId
  );

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

  const { matchUps } = generateDrawMaticRound({
    tournamentParticipants,
    drawDefinition,
    participantIds,
    matchUpIds,
    structureId,
    structure,
    eventType,
  });

  return { ...SUCCESS, matchUps };
}
