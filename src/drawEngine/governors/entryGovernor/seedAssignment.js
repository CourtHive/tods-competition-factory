import { getStructureSeedAssignments } from '../../getters/getStructureSeedAssignments';
import { modifySeedAssignmentsNotice } from '../../notifications/drawNotifications';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { decorateResult } from '../../../global/functions/decorateResult';
import { participantInEntries } from '../../getters/entryGetter';
import { isValidSeedPosition } from '../../getters/seedGetter';
import { findStructure } from '../../getters/findStructure';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_DRAW_POSITION_FOR_SEEDING,
  INVALID_PARTICIPANT_ID,
  INVALID_SEED_NUMBER,
} from '../../../constants/errorConditionConstants';

export function assignSeed({
  tournamentRecord,
  drawDefinition,
  participantId,
  structureId,
  seedNumber,
  seedValue,
  eventId,
}) {
  const stack = 'assignSeed';
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
    return decorateResult({
      result: { error: INVALID_PARTICIPANT_ID },
      context: { participantId },
      stack,
    });

  const relevantAssignment = positionAssignments.find(
    (assignment) => assignment.participantId === participantId
  );
  const assignedDrawPosition = relevantAssignment?.drawPosition;

  if (assignedDrawPosition) {
    const positionIsValid = isValidSeedPosition({
      drawPosition: assignedDrawPosition,
      drawDefinition,
      structureId,
      seedNumber,
    });
    if (!positionIsValid)
      return decorateResult({
        result: { error: INVALID_DRAW_POSITION_FOR_SEEDING },
        context: { assignedDrawPosition },
        info: 'invalid seed position',
        stack,
      });
  }

  if (!seedNumbers.includes(seedNumber)) {
    seedAssignments.push({ seedNumber, seedValue });
  }

  let success;
  seedAssignments.forEach((assignment) => {
    // ensure that this participantId is not assigned to any other seedNumber
    if (
      assignment.participantId === participantId &&
      assignment.seedNumber !== seedNumber
    ) {
      assignment.participantId = undefined;
    }
    // assign participantId to target seedNumber
    if (assignment.seedNumber === seedNumber) {
      assignment.participantId = participantId;
      // assignment.seedValue = (seedValue || seedNumber)?.toString();
      assignment.seedValue = seedValue || seedNumber;
      success = true;
    }
  });

  if (success) {
    modifySeedAssignmentsNotice({
      tournamentId: tournamentRecord?.tournamentId,
      structureIds: [structureId],
      drawDefinition,
      structure,
      eventId,
    });
    return { ...SUCCESS };
  }

  return decorateResult({ result: { error: INVALID_SEED_NUMBER }, stack });
}
