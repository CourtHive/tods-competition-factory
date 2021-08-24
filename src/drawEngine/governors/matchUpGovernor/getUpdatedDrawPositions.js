import { numericSort } from '../../../utilities';

/**
 * ensures that a matchUp has 2 and only 2 drawPositions
 * Checks to see whether drawPosition is already present in drawPositions
 * Does NOT allow a position to be assigned if there are already 2 drawPositions
 *
 * @param {number} drawPosition - drawPosition which is to be assigned to a matchUp
 * @param {number[]} drawPositions - existing drawPositions
 *
 */
export function getUpdatedDrawPositions({ drawPosition, drawPositions }) {
  let positionAdded;
  let positionAssigned = drawPositions.includes(drawPosition);
  const updatedDrawPositions = positionAssigned
    ? drawPositions
    : []
        .concat(...drawPositions, undefined, undefined)
        .slice(0, 2) // accounts for empty array, should always have length 2
        .map((position) => {
          if (!position && !positionAssigned) {
            positionAssigned = true;
            positionAdded = true;
            return drawPosition;
          } else {
            return position;
          }
        })
        .sort(numericSort);

  return { updatedDrawPositions, positionAdded, positionAssigned };
}
