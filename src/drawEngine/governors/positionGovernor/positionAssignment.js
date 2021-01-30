import { findStructure } from '../../getters/findStructure';
import { isValidSeedPosition } from '../../getters/seedGetter';
import { participantInEntries } from '../../getters/entryGetter';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { getStructureSeedAssignments } from '../../getters/getStructureSeedAssignments';
import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { structureActiveDrawPositions } from '../../getters/structureActiveDrawPositions';
import { getPairedDrawPosition } from '../../getters/getPairedDrawPosition';
import { assignMatchUpDrawPosition } from '../matchUpGovernor/assignMatchUpDrawPosition';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_DRAW_POSITION,
  INVALID_PARTICIPANT_ID,
  EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT,
  INVALID_DRAW_POSITION_FOR_SEEDING,
  DRAW_POSITION_ACTIVE,
} from '../../../constants/errorConditionConstants';
import { CONTAINER } from '../../../constants/drawDefinitionConstants';

export function assignDrawPosition({
  drawDefinition,
  mappedMatchUps,
  structureId,
  drawPosition,
  participantId,
  isByeReplacement,
  placementScenario,
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
    const { activeDrawPositions } = structureActiveDrawPositions({
      drawDefinition,
      structureId,
    });
    const drawPositionIsActive = activeDrawPositions.includes(drawPosition);
    if (drawPositionIsActive) {
      return { error: DRAW_POSITION_ACTIVE };
    }
  }

  positionAssignments.forEach((assignment) => {
    if (assignment.drawPosition === drawPosition) {
      assignment.participantId = participantId;
      delete assignment.bye;
    }
  });

  if (structure.structureType !== CONTAINER) {
    addDrawPositionToMatchUps({
      drawDefinition,
      mappedMatchUps,
      structure,
      drawPosition,
      positionAssignments,
      isByeReplacement,
      placementScenario,
    });
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

function addDrawPositionToMatchUps({
  drawDefinition,
  mappedMatchUps,
  structure,
  drawPosition,
  positionAssignments,
  isByeReplacement,
  placementScenario,
}) {
  const matchUpFilters = { isCollectionMatchUp: false };
  const { matchUps } = getAllStructureMatchUps({
    drawDefinition,
    mappedMatchUps,
    matchUpFilters,
    structure,
  });

  const { matchUp, pairedDrawPosition } = getPairedDrawPosition({
    matchUps,
    drawPosition,
  });
  const pairedDrawPositionIsBye = positionAssignments.find(
    ({ drawPosition }) => drawPosition === pairedDrawPosition
  )?.bye;
  if (isByeReplacement) {
    const result = assignMatchUpDrawPosition({
      drawDefinition,
      mappedMatchUps,
      drawPosition,
      isByeReplacement,
      placementScenario,
      matchUpId: matchUp.matchUpId,
    });
    if (result.error) return result;
  } else if (pairedDrawPositionIsBye) {
    const result = assignMatchUpDrawPosition({
      drawDefinition,
      mappedMatchUps,
      drawPosition,
      isByeReplacement: true,
      matchUpId: matchUp.matchUpId,
    });
    if (result.error) return result;
  }
}
