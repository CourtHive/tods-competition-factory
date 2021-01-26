import {
  allNumeric,
  chunkArray,
  isOdd,
  noNumeric,
  numericSort,
} from '../../../utilities';

export function getOrderedDrawPositions({
  drawPositions,
  roundProfile,
  roundNumber,
}) {
  // when both present, drawPositions are always sorted numerically
  // this holds true even when fed positions encounter each other in later rounds
  // sideNumber 1 always goes to the lower drawPosition
  if (allNumeric(drawPositions)) return drawPositions.sort(numericSort);

  // if no drawPositions are present, no sideNumbers will be generated, order unimportant
  if (noNumeric(drawPositions)) return [undefined, undefined];

  const isFeedRound = roundProfile[roundNumber].feedRound;
  if (isFeedRound) {
    const drawPosition = drawPositions.find(
      (drawPosition) => !isNaN(parseInt(drawPosition))
    );
    return [drawPosition, undefined];
  }

  /*
  const targetRoundNumber = (roundNumber > 1 && roundNumber - 1) || roundNumber;
  const priorRoundDrawPositions =
    chunkArray(roundProfile[targetRoundNumber].drawPositions, 2) || [];
  const priorRoundIndices = drawPositions.map((drawPosition) =>
    priorRoundDrawPositions.reduce((value, pair, index) => {
      return pair.filter((f) => f).includes(drawPosition) ? index : value;
    }, undefined)
  );
  // console.log(priorRoundDrawPositions, drawPositions, priorRoundIndices);
  const advancedPosition = (drawPositions || []).find((drawPosition) =>
    priorRoundDrawPositions.includes(drawPosition)
  );
  if (advancedPosition && isFeedRound) {
    const inferredSideNumber =
      priorRoundDrawPositions.indexOf(advancedPosition) + 1;
  }
  */

  const firstRoundMatchUpsCount = roundProfile[1].matchUpsCount;
  const currentRoundMatchUpsCount = roundProfile[roundNumber].matchUpsCount;
  const positionsChunkSize =
    firstRoundMatchUpsCount / currentRoundMatchUpsCount;

  if (positionsChunkSize > 1) {
    const drawPosition = drawPositions.find(
      (drawPosition) => !isNaN(parseInt(drawPosition))
    );
    // for normal rounds the first round drawPositions are chunked
    // the order of a drawPositions is determined by the index of the chunk where it appears
    const firstRoundDrawPositions = roundProfile[1].drawPositions;
    const drawPositionsChunks = chunkArray(
      firstRoundDrawPositions,
      positionsChunkSize
    );
    const drawPositionChunkIndex = drawPositionsChunks.reduce(
      (index, chunk, i) => (chunk.includes(drawPosition) ? i : index),
      undefined
    );

    // this is counter-intuitive because the chunkPositionIndex returns an odd number for an even position
    // e.g. the first drawPosition count is odd, but the index is 0 (even)
    return isOdd(drawPositionChunkIndex)
      ? [undefined, drawPosition]
      : [drawPosition, undefined];
  }

  console.log({ roundNumber, drawPositions });
  return drawPositions;
}
