import { qualifierDrawPositionAssignment as positionQualifier } from '../../../../drawEngine/governors/positionGovernor/positionQualifier';

/**
 *
 * @param {string} drawId - id of drawDefinition within which structure is found
 * @param {string} structureId - id of structure of drawPosition
 * @param {number} drawPosition - drawPosition where lucky loser participantId will be assigned
 * @param {string} qualifierParticipantId - id of participant
 *
 */
export function qualifierDrawPositionAssignment(params) {
  return positionQualifier(params);
}
