import { swapDrawPositionAssignments as positionSwap } from '../matchUps/drawPositions/positionSwap';

/**
 *
 * @param {string} drawId - id of drawDefinition within which structure is found
 * @param {string} structureId - id of structure of drawPosition
 * @param {number[]} drawPositions - drawPositions for which participants will be swapped
 *
 */
export function swapDrawPositionAssignments(params) {
  return positionSwap(params);
}
