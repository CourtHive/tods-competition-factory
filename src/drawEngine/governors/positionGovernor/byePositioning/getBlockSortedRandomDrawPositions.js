import { chunkArray } from '../../../../utilities';

export function getBlockSortedRandomDrawPositions({
  validSeedBlocks,
  byesToPlace,
}) {
  const drawPositions = [];
  validSeedBlocks.forEach((seedBlock) => {
    const leftToPlace = byesToPlace - drawPositions.length;
    if (leftToPlace > seedBlock.drawPositions.length) {
      drawPositions.push(...seedBlock.drawPositions);
    } else {
      const nestedDrawPositions = arrayChunks(
        chunkArray(seedBlock.drawPositions, 2)
      );
      let drawPosition;
      while ((drawPosition = sideWithMore(nestedDrawPositions))) {
        drawPositions.push(drawPosition);
      }
    }
  });
  return drawPositions.flat(Infinity);
}

function sideWithMore(arr) {
  if (Array.isArray(arr) && arr.length !== 2) return arr.pop();
  if (!Array.isArray(arr[0]))
    return Math.round(Math.random()) ? arr.pop() : arr.shift();

  const side1 = arr[0].flat(Infinity).length;
  const side2 = arr[1].flat(Infinity).length;
  if (side1 === side2) return sideWithMore(arr[Math.round(Math.random())]);
  return side1 < side2 ? sideWithMore(arr[1]) : sideWithMore(arr[0]);
}

function arrayChunks(arr) {
  const midPoint = Math.floor(arr.length / 2);
  return arr.length > 2
    ? [arrayChunks(arr.slice(0, midPoint)), arrayChunks(arr.slice(midPoint))]
    : arr;
}
