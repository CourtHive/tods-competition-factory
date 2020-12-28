import { swapDrawPositionAssignments as positionSwap } from '../../../../drawEngine/governors/positionGovernor/positionSwap';

/**
 *
 * @param {string} drawId - id of drawDefinition within which structure is found
 * @param {string} structureId - id of structure of drawPosition
 * @param {number[]} drawPositions - drawPositions for which particpants will be swapped
 *
 */
export function swapDrawPositionAssignments(props) {
  return positionSwap(props);
}
