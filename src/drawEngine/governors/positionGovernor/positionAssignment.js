import { findStructure } from '../../getters/findStructure';
import { isValidSeedPosition } from '../../getters/seedGetter';
import { participantInEntries } from '../../getters/entryGetter';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { getStructureSeedAssignments } from '../../getters/getStructureSeedAssignments';

import { SUCCESS } from '../../../constants/resultConstants';

export function assignDrawPosition({
  drawDefinition,
  structureId,
  drawPosition,
  participantId,
}) {
  const { structure } = findStructure({ drawDefinition, structureId });
  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const { seedAssignments } = getStructureSeedAssignments({ structure });

  const validParticipantId = participantInEntries({
    drawDefinition,
    participantId,
  });
  if (!validParticipantId) return { error: 'Invalid participantId' };

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
      return { error: 'Invalid drawPosition for participant seedAssignment' };
  }

  const positionState = positionAssignments.reduce(
    (p, c) => (c.drawPosition === drawPosition ? c : p),
    undefined
  );
  const participantExists = positionAssignments
    .map(d => d.participantId)
    .includes(participantId);

  if (!positionState) return { error: 'Invalid draw position' };
  if (participantExists) return { error: 'Participant already assigned' };
  if (drawPositionFilled(positionState))
    return { error: `drawPosition ${drawPosition} is occupied` };

  positionAssignments.forEach(assignment => {
    if (assignment.drawPosition === drawPosition) {
      assignment.participantId = participantId;
      delete assignment.qualifier;
      delete assignment.bye;
    }
  });

  return SUCCESS;

  function drawPositionFilled(positionState) {
    const containsBye = positionState.bye;
    const containsQualifier = positionState.qualifier;
    const containsParticipant = positionState.participantId;
    return containsBye || containsQualifier || containsParticipant;
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
  if (!validParticipantId) return { error: 'Invalid participantId' };

  console.log({structure, validParticipantId})
  
  return SUCCESS;
}
*/
