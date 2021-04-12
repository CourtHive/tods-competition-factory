import { luckyLoserDrawPositionAssignment as positionLuckyLoser } from '../../../../drawEngine/governors/positionGovernor/positionLuckyLoser';

/**
 *
 * @param {string} drawId - id of drawDefinition within which structure is found
 * @param {string} structureId - id of structure of drawPosition
 * @param {number} drawPosition - drawPosition where lucky loser participantId will be assigned
 * @param {string} luckyLoserParticipantId - id of participant
 *
 */
export function luckyLoserDrawPositionAssignment(props) {
  return positionLuckyLoser(props);
}
