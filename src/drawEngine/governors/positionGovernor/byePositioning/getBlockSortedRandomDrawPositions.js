import { chunkArray } from '../../../../utilities';

export function getBlockSortedRandomDrawPositions({
  //relevantDrawPositions,
  validSeedBlocks,
  byesToPlace,
}) {
  const drawPositions = [];
  validSeedBlocks.forEach((seedBlock) => {
    const leftToPlace = byesToPlace - drawPositions.length;
    if (leftToPlace > seedBlock.drawPositions.length) {
      drawPositions.push(...seedBlock.drawPositions);
    } else {
      // how many times can leftToPlace be divided by two?
      const divs = Math.floor(Math.cbrt(leftToPlace));
      console.log({ divs });
    }
  });
  // const blockSortedRandomDrawPositions = [].concat(
  //   ...validSeedBlocks.map((seedBlock) => shuffleArray(seedBlock.drawPositions))
  // );
  // .filter((drawPosition) => relevantDrawPositions.includes(drawPosition));
}

export function twoDivs(arr) {
  return arr.length > 2 ? chunkArray(arr, 2).map(twoDivs) : arr;
}

export function arrayChunks(arr) {
  const midPoint = Math.floor(arr.length / 2);
  return arr.length > 2
    ? arrayChunks([arr.slice(0, midPoint), arr.slice(midPoint)])
    : arr;
}
