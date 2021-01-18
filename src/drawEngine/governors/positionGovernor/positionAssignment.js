import { findStructure } from '../../getters/findStructure';
import { isValidSeedPosition } from '../../getters/seedGetter';
import { participantInEntries } from '../../getters/entryGetter';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { getStructureSeedAssignments } from '../../getters/getStructureSeedAssignments';
import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { getPairedDrawPosition } from '../../getters/getPairedDrawPosition';
import { assignDrawPositionBye } from './byePositioning/assignDrawPositionBye';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  DRAW_POSITION_ASSIGNED,
  INVALID_DRAW_POSITION,
  INVALID_PARTICIPANT_ID,
  EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT,
  INVALID_DRAW_POSITION_FOR_SEEDING,
} from '../../../constants/errorConditionConstants';
import { CONTAINER } from '../../../constants/drawDefinitionConstants';

export function assignDrawPosition({
  drawDefinition,
  structureId,
  drawPosition,
  participantId,
}) {
  const { structure } = findStructure({ drawDefinition, structureId });
  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const { seedAssignments } = getStructureSeedAssignments({
    drawDefinition,
    structure,
  });

  const validParticipantId = participantInEntries({
    drawDefinition,
    participantId,
  });
  if (!validParticipantId) {
    return {
      error: INVALID_PARTICIPANT_ID,
      participantId,
      method: 'assignDrawPosition',
    };
  }

  const participantSeedNumber = seedAssignments.reduce(
    (seedNumber, assignment) => {
      return assignment.participantId === participantId
        ? assignment.seedNumber
        : seedNumber;
    },
    undefined
  );

  if (participantSeedNumber) {
    const isValidDrawPosition = isValidSeedPosition({
      structureId,
      drawPosition,
      drawDefinition,
      seedNumber: participantSeedNumber,
    });
    if (!isValidDrawPosition)
      return { error: INVALID_DRAW_POSITION_FOR_SEEDING };
  }

  const positionState = positionAssignments.reduce(
    (p, c) => (c.drawPosition === drawPosition ? c : p),
    undefined
  );
  const participantExists = positionAssignments
    .map((d) => d.participantId)
    .includes(participantId);

  if (!positionState) return { error: INVALID_DRAW_POSITION };
  if (participantExists)
    return { error: EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT };
  const { filled } = drawPositionFilled(positionState);
  if (filled && positionState.participantId !== participantId) {
    return { error: DRAW_POSITION_ASSIGNED };
  }

  positionAssignments.forEach((assignment) => {
    if (assignment.drawPosition === drawPosition) {
      assignment.participantId = participantId;
      delete assignment.qualifier;
      delete assignment.bye;
    }
  });

  if (structure.structureType !== CONTAINER) {
    const matchUpFilters = { isCollectionMatchUp: false };
    const { matchUps } = getAllStructureMatchUps({
      drawDefinition,
      matchUpFilters,
      structure,
    });

    const pairedDrawPosition = getPairedDrawPosition({
      matchUps,
      drawPosition,
    });
    const pairedDrawPositionIsBye = positionAssignments.find(
      ({ drawPosition }) => drawPosition === pairedDrawPosition
    )?.bye;
    if (pairedDrawPositionIsBye) {
      // re-assign the BYE to benefit from propagation
      assignDrawPositionBye({
        drawDefinition,
        structureId,
        drawPosition: pairedDrawPosition,
      });
    }
  }

  return Object.assign({ positionAssignments }, SUCCESS);

  function drawPositionFilled(positionState) {
    const containsBye = positionState.bye;
    const containsQualifier = positionState.qualifier;
    const containsParticipant = positionState.participantId;
    const filled = containsBye || containsQualifier || containsParticipant;
    return { containsBye, containsQualifier, containsParticipant, filled };
  }
}

/*
export function assignCollectionPosition({
  drawDefinition,
  structureId,
  participantId,
  collectionPosition,
}) {
  const { structure } = findStructure({ drawDefinition, structureId });
  
  const validParticipantId = participantInEntries({drawDefinition, participantId});
  if (!validParticipantId) return { error: INVALID_PARTICIPANT_ID };

  console.log({structure, validParticipantId})
  
  return SUCCESS;
}
*/
