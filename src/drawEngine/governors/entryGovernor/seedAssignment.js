import { participantInEntries } from 'competitionFactory/drawEngine/getters/entryGetter';
import { structureAssignedDrawPositions } from 'competitionFactory/drawEngine/getters/positionsGetter';
import { isValidSeedPosition } from 'competitionFactory/drawEngine/getters/seedGetter';
import { findStructure, getStructureSeedAssignments } from 'competitionFactory/drawEngine/getters/structureGetter';

import { SUCCESS } from 'competitionFactory/constants/resultConstants';

export function assignSeed({drawDefinition, structureId, seedNumber, seedValue, participantId}) {
  const { structure } = findStructure({ drawDefinition, structureId });
  const { positionAssignments } = structureAssignedDrawPositions({structure});
  const { seedAssignments } = getStructureSeedAssignments({structure});
  const seedNumbers = seedAssignments.map(assignment => assignment.seedNumber);

  const validParticipantId = participantInEntries({drawDefinition, participantId});
  if (!validParticipantId) return { error: 'Invalid participantId' };

  const assignedDrawPosition = positionAssignments.reduce((drawPosition, assignment) => {
    return assignment.participantId === participantId ? assignment.drawPosition : drawPosition;
  }, undefined);

  if (assignedDrawPosition) {
    const positionIsValid = isValidSeedPosition({drawDefinition, structureId, drawPosition: assignedDrawPosition});
    if (!positionIsValid) return { error: 'Invalid drawPosition for seeded participant' };
  }
  
  if (seedNumbers.includes(seedNumber)) {
    let result = {};
    seedAssignments.forEach(assignment => {
      // insure that this participantId is not assigned to any other seedNumber
      if (assignment.participantId === participantId && assignment.seedNumber !== seedNumber) {
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
    return { error: 'seedNumber not valid for structure' };
  }
}