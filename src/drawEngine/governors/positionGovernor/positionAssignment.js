import { addExtension } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { findExtension } from '../../../tournamentEngine/governors/queryGovernor/extensionQueries';
import { modifyRoundRobinMatchUpsStatus } from '../matchUpGovernor/modifyRoundRobinMatchUpsStatus';
import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { structureActiveDrawPositions } from '../../getters/structureActiveDrawPositions';
import { assignMatchUpDrawPosition } from '../matchUpGovernor/assignMatchUpDrawPosition';
import { getStructureSeedAssignments } from '../../getters/getStructureSeedAssignments';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { getPairedDrawPosition } from '../../getters/getPairedDrawPosition';
import { participantInEntries } from '../../getters/entryGetter';
import { isValidSeedPosition } from '../../getters/seedGetter';
import { findStructure } from '../../getters/findStructure';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_DRAW_POSITION,
  INVALID_PARTICIPANT_ID,
  EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT,
  INVALID_DRAW_POSITION_FOR_SEEDING,
  DRAW_POSITION_ACTIVE,
} from '../../../constants/errorConditionConstants';
import { CONTAINER } from '../../../constants/drawDefinitionConstants';

// NOTE: see TODO below for manual positioning of participants in feed arms

export function assignDrawPosition({
  drawDefinition,
  mappedMatchUps,
  structureId,
  drawPosition,
  participantId,
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

  const positionAssignment = positionAssignments.reduce(
    (p, c) => (c.drawPosition === drawPosition ? c : p),
    undefined
  );
  const participantExists = positionAssignments
    .map((d) => d.participantId)
    .includes(participantId);

  if (!positionAssignment) return { error: INVALID_DRAW_POSITION };
  if (participantExists)
    return { error: EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT };
  const { filled } = drawPositionFilled(positionAssignment);
  if (filled && positionAssignment.participantId !== participantId) {
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
      placementScenario,
    });
  } else {
    modifyRoundRobinMatchUpsStatus({
      positionAssignments,
      drawDefinition,
      structure,
    });
  }

  if (!placementScenario) {
    // START: ############## telemetry ##############
    const { extension } = findExtension({
      element: drawDefinition,
      name: 'positionActions',
    });
    const action = {
      name: 'positionAssignment',
      drawPosition,
      structureId,
      participantId,
    };
    const updatedExtension = {
      name: 'positionActions',
      value: Array.isArray(extension?.value)
        ? extension.value.concat(action)
        : [action],
    };
    addExtension({ element: drawDefinition, extension: updatedExtension });
    // END: ############## telemetry ##############
  }
  return Object.assign({ positionAssignments }, SUCCESS);

  function drawPositionFilled(positionAssignment) {
    const containsBye = positionAssignment.bye;
    const containsQualifier = positionAssignment.qualifier;
    const containsParticipant = positionAssignment.participantId;
    const filled = containsBye || containsQualifier || containsParticipant;
    return { containsBye, containsQualifier, containsParticipant, filled };
  }
}

function addDrawPositionToMatchUps({
  drawDefinition,
  mappedMatchUps,
  structure,
  drawPosition,
  placementScenario,
}) {
  const matchUpFilters = { isCollectionMatchUp: false };
  const { matchUps } = getAllStructureMatchUps({
    drawDefinition,
    mappedMatchUps,
    matchUpFilters,
    structure,
  });

  // This function was developed for testing harness and is used here for convenience
  // paired position can be found in roundProfile...
  // TODO: This will probably have to be changed to use roundProfile and to find the first roundNumber
  // where the drawPosition occurrs... this will be for manual placement in feed arm positions...
  const { matchUp } = getPairedDrawPosition({
    matchUps,
    drawPosition,
  });
  if (matchUp) {
    const result = assignMatchUpDrawPosition({
      drawDefinition,
      mappedMatchUps,
      drawPosition,
      placementScenario,
      matchUpId: matchUp.matchUpId,
    });
    if (result.error) return result;
  }
}
