import { modifyRoundRobinMatchUpsStatus } from '../matchUpGovernor/modifyRoundRobinMatchUpsStatus';
import { conditionallyDisableLinkPositioning } from './conditionallyDisableLinkPositioning';
import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { structureActiveDrawPositions } from '../../getters/structureActiveDrawPositions';
import { assignMatchUpDrawPosition } from '../matchUpGovernor/assignMatchUpDrawPosition';
import { getStructureSeedAssignments } from '../../getters/getStructureSeedAssignments';
import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { getInitialRoundNumber } from '../../getters/getInitialRoundNumber';
import { addPositionActionTelemetry } from './addPositionActionTelemetry';
import { isValidSeedPosition } from '../../getters/seedGetter';
import { findStructure } from '../../getters/findStructure';
import { clearDrawPosition } from './positionClear';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_DRAW_POSITION,
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
  automaticPlacement,
}) {
  const { structure } = findStructure({ drawDefinition, structureId });
  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const { seedAssignments } = getStructureSeedAssignments({
    drawDefinition,
    structure,
  });

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

  const positionAssignment = positionAssignments.find(
    (assignment) => assignment.drawPosition === drawPosition
  );
  if (!positionAssignment) return { error: INVALID_DRAW_POSITION };

  const participantExists = positionAssignments
    .map((d) => d.participantId)
    .includes(participantId);
  if (participantExists)
    return { error: EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT };

  const { containsParticipant, containsBye } = drawPositionFilled(
    positionAssignment
  );
  if (
    containsParticipant &&
    positionAssignment.participantId !== participantId
  ) {
    const { activeDrawPositions } = structureActiveDrawPositions({
      drawDefinition,
      structureId,
    });
    const drawPositionIsActive = activeDrawPositions.includes(drawPosition);
    if (drawPositionIsActive) {
      return { error: DRAW_POSITION_ACTIVE };
    }
  }

  if (containsBye) {
    let result = clearDrawPosition({
      drawDefinition,
      drawPosition,
      structureId,
    });
    if (result.error) return result;
  }

  positionAssignment.participantId = participantId;

  if (structure.structureType !== CONTAINER) {
    addDrawPositionToMatchUps({
      drawDefinition,
      mappedMatchUps,
      structure,
      drawPosition,
      positionAssignments,
      automaticPlacement,
    });
  } else {
    modifyRoundRobinMatchUpsStatus({
      positionAssignments,
      drawDefinition,
      structure,
    });
  }

  if (!automaticPlacement) {
    conditionallyDisableLinkPositioning({
      structure,
      drawPositions: [drawPosition],
    });
    const positionAction = {
      name: 'positionAssignment',
      drawPosition,
      structureId,
      participantId,
    };
    addPositionActionTelemetry({ drawDefinition, positionAction });
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
  automaticPlacement,
}) {
  const matchUpFilters = { isCollectionMatchUp: false };
  const { matchUps } = getAllStructureMatchUps({
    drawDefinition,
    mappedMatchUps,
    matchUpFilters,
    structure,
  });

  const { roundMatchUps } = getRoundMatchUps({ matchUps });
  const { initialRoundNumber } = getInitialRoundNumber({
    drawPosition,
    matchUps,
  });

  const matchUp = roundMatchUps[initialRoundNumber].find((matchUp) =>
    matchUp.drawPositions.includes(drawPosition)
  );

  if (matchUp) {
    const result = assignMatchUpDrawPosition({
      drawDefinition,
      mappedMatchUps,
      drawPosition,
      automaticPlacement,
      matchUpId: matchUp.matchUpId,
    });
    if (result.error) return result;
  }
}
