import { intersection, noNumeric } from '../../../utilities';

export function getOrderedDrawPositions({
  drawPositions,
  roundProfile,
  roundNumber,
}) {
  // if no drawPositions are present, no sideNumbers will be generated, order unimportant
  if (noNumeric(drawPositions)) return [undefined, undefined];

  return roundProfile[roundNumber].pairedDrawPositions.find(
    (pair) =>
      intersection(
        pair,
        drawPositions.filter((f) => f)
      ).length
  );
}
