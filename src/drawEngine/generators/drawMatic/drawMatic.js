import { participantScaleItem } from '../../../tournamentEngine/accessors/participantScaleItem';
import { AD_HOC, stageOrder } from '../../../constants/drawDefinitionConstants';
import { getParticipantId } from '../../../global/functions/extractors';
import { generateDrawMaticRound } from './generateDrawMaticRound';
import { isAdHoc } from '../../governors/queryGovernor/isAdHoc';

import { STRUCTURE_SELECTED_STATUSES } from '../../../constants/entryStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { SINGLES } from '../../../constants/eventConstants';
import { RATING } from '../../../constants/scaleConstants';
import {
  INVALID_DRAW_DEFINITION,
  INVALID_PARTICIPANT_ID,
  INVALID_VALUES,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

/**
 *
 * @param {object} drawDefinition - provided automatically by drawEngine
 * @param {string} structureId - optional - defaults to the first structure of latest stage
 * @param {string[]} participantIds - optional - allows a subset of drawDefinition.entries to be specified
 *
 */
export function drawMatic({
  tournamentParticipants,
  restrictEntryStatus,
  tournamentRecord,
  generateMatchUps,
  drawDefinition,
  participantIds,
  maxIterations,
  structureId,
  matchUpIds,
  scaleName, // custom rating name to seed dynamic ratings
  event,
}) {
  if (
    typeof drawDefinition !== 'object' ||
    (drawDefinition.drawType && drawDefinition.drawType !== AD_HOC)
  )
    return { error: INVALID_DRAW_DEFINITION };

  if (
    !Array.isArray(drawDefinition.entries) ||
    (participantIds && !Array.isArray(participantIds))
  )
    return { error: INVALID_VALUES };

  const { eventType } = event || {};

  const enteredParticipantIds = drawDefinition.entries
    .filter(
      ({ entryStatus }) =>
        !restrictEntryStatus ||
        STRUCTURE_SELECTED_STATUSES.includes(entryStatus)
    )
    .map(getParticipantId);

  if (participantIds) {
    // ensure all participantIds are in drawDefinition.entries
    const invalidParticipantIds = participantIds.filter(
      (participantId) => !enteredParticipantIds.includes(participantId)
    );

    if (invalidParticipantIds?.length)
      return {
        error: INVALID_PARTICIPANT_ID,
        invalidParticipantIds,
      };
  } else {
    participantIds = enteredParticipantIds;
  }

  // if no structureId is specified find the latest AD_HOC stage which has matchUps
  if (!structureId) {
    const targetStructure = drawDefinition.structures
      ?.filter((structure) => structure.stageSequence === 1)
      ?.reduce((targetStructure, structure) => {
        const orderNumber = stageOrder[structure.stage];
        const structureIsAdHoc = isAdHoc({ drawDefinition, structure });

        return structureIsAdHoc &&
          orderNumber > (stageOrder[targetStructure?.stage] || 1)
          ? structure
          : targetStructure;
      }, undefined);
    structureId = targetStructure?.structureId;
  }

  const structure = drawDefinition.structures?.find(
    (structure) => structure.structureId === structureId
  );
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  // an AD_HOC structure is one that has no child structures and in which no matchUps have roundPosition
  const structureIsAdHoc = isAdHoc({ drawDefinition, structure });
  if (!structureIsAdHoc) return { error: INVALID_DRAW_DEFINITION };

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

  const { candidatesCount, iterations, participantIdPairings } =
    generateDrawMaticRound({
      tournamentParticipants,
      tournamentRecord,
      generateMatchUps,
      drawDefinition,
      participantIds,
      maxIterations,
      adHocRatings,
      matchUpIds,
      structureId,
      structure,
      eventType,
    });

  return { ...SUCCESS, candidatesCount, iterations, participantIdPairings };
}

function getScaleValue({ scaleName = 'dynamic', eventType, participant }) {
  const scaleAttributes = {
    eventType: eventType || SINGLES,
    scaleType: RATING,
    scaleName,
  };
  const result =
    participant &&
    participantScaleItem({
      scaleAttributes,
      participant,
    });
  return result?.scaleItem?.scaleValue;
}
