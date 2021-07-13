import { findStructure } from '../../getters/findStructure';
import { isValidSeedPosition } from '../../getters/seedGetter';
import { participantInEntries } from '../../getters/entryGetter';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { getStructureSeedAssignments } from '../../getters/getStructureSeedAssignments';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_DRAW_POSITION_FOR_SEEDING,
  INVALID_PARTICIPANT_ID,
  INVALID_SEED_NUMBER,
} from '../../../constants/errorConditionConstants';

export function assignSeed({
  drawDefinition,
  participantId,
  structureId,
  seedNumber,
  seedValue,
}) {
  const { structure } = findStructure({ drawDefinition, structureId });
  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const { seedAssignments } = getStructureSeedAssignments({
    drawDefinition,
    structure,
  });
  const seedNumbers = seedAssignments.map(
    (assignment) => assignment.seedNumber
  );

  const validParticipantId = participantInEntries({
    drawDefinition,
    participantId,
  });
  if (participantId && !validParticipantId)
    return {
      error: INVALID_PARTICIPANT_ID,
      participantId,
      method: 'assignSeed',
    };

  const relevantAssignment = positionAssignments.find(
    (assignment) => assignment.participantId === participantId
  );
  const assignedDrawPosition = relevantAssignment?.drawPosition;

  if (assignedDrawPosition) {
    const positionIsValid = isValidSeedPosition({
      seedNumber,
      drawDefinition,
      structureId,
      drawPosition: assignedDrawPosition,
    });
    if (!positionIsValid) return { error: INVALID_DRAW_POSITION_FOR_SEEDING };
  }

  if (seedNumbers.includes(seedNumber)) {
    const result = {};
    seedAssignments.forEach((assignment) => {
      // insure that this participantId is not assigned to any other seedNumber
      if (
        assignment.participantId === participantId &&
        assignment.seedNumber !== seedNumber
      ) {
        assignment.participantId = undefined;
      }
      // assign participantId to target seedNumber
      if (assignment.seedNumber === seedNumber) {
        assignment.participantId = participantId;
        assignment.seedValue = seedValue || seedNumber;
        Object.assign(result, SUCCESS);
      }
    });
    return result;
  } else {
    return { error: INVALID_SEED_NUMBER };
  }
}
