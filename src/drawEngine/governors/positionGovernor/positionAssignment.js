import { isValidSeedPosition } from '../../getters/seedGetter';
import { participantInEntries } from '../../getters/entryGetter';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import {
  findStructure,
  getStructureSeedAssignments,
} from '../../getters/structureGetter';

import { SUCCESS } from '../../../constants/resultConstants';

export function assignDrawPosition({
  policies,
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

  const participantIsSeed = seedAssignments.reduce((isSeed, assignment) => {
    return assignment.participantId === participantId ? true : isSeed;
  }, false);

  if (participantIsSeed) {
    const isValidDrawPosition = isValidSeedPosition({
      policies,
      drawDefinition,
      structureId,
      drawPosition,
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
