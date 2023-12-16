import { alternateDrawPositionAssignment as positionAlternate } from '../../../../mutate/matchUps/drawPositions/positionAlternate';

/**
 *
 * @param {string} drawId - id of drawDefinition within which structure is found
 * @param {string} structureId - id of structure of drawPosition
 * @param {number} drawPosition - drawPosition where alternate participantId will be assigned
 * @param {string} alternateParticipantId - id of participant
 *
 */
export function alternateDrawPositionAssignment(params) {
  return positionAlternate(params);
}
