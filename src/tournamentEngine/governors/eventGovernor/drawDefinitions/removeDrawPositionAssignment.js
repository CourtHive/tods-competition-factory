import { clearDrawPosition } from '../../../../drawEngine/governors/positionGovernor/positionClear';

/**
 *
 * @param {string} drawId - id of drawDefinition within which structure is found
 * @param {string} structureId - id of structure of drawPosition
 * @param {number} drawPosition - number of drawPosition for which actions are to be returned
 *
 */
export function removeDrawPositionAssignment(props) {
  return clearDrawPosition(props);
}
