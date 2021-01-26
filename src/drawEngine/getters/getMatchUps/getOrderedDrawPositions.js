import {
  allNumeric,
  chunkArray,
  intersection,
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

  const orderedPositions = chunkArray(
    roundProfile[roundNumber].drawPositions,
    2
  ).find(
    (chunk) =>
      intersection(
        chunk,
        drawPositions.filter((f) => f)
      ).length
  );

  return orderedPositions;
}
