import {
  allNumeric,
  overlap,
  noNumeric,
  numericSort,
} from '../../../utilities';

export function getOrderedDrawPositions({
  drawPositions,
  roundProfile,
  roundNumber,
}) {
  const unassignedDrawPositions = [undefined, undefined];

  if (noNumeric(drawPositions)) {
    return {
      orderedDrawPositions: unassignedDrawPositions,
      displayOrder: unassignedDrawPositions,
    };
  }

  const targetRoundProfile = roundProfile[roundNumber];
  const displayOrder =
    targetRoundProfile?.pairedDrawPositions.find((pair) =>
      overlap(pair || [], drawPositions.filter(Boolean))
    ) || unassignedDrawPositions;

  // ############# IMPORTANT DO NOT CHANGE #################
  // when both present, drawPositions are always sorted numerically
  // this holds true even when fed positions encounter each other in later rounds
  // { sideNumber: 1 } always goes to the lower drawPosition
  // displayOrder for feedRounds follows this rule...
  // ...but displayOrder for non-fed rounds must look back to the previous round
  // previous round lookback is provided by the roundProfile
  const isFeedRound = targetRoundProfile?.feedRound;
  if (allNumeric(drawPositions)) {
    const orderedDrawPositions = drawPositions.sort(numericSort);
    return {
      orderedDrawPositions,
      displayOrder: isFeedRound ? orderedDrawPositions : displayOrder,
    };
  }

  // ############# IMPORTANT DO NOT CHANGE #################
  // when only one side is present in a feedRound, it is the fed position
  // and fed positions are always { sideNumber: 1 }
  if (isFeedRound) {
    const drawPosition = drawPositions.find(
      (drawPosition) => !isNaN(parseInt(drawPosition))
    );
    const orderedDrawPositions = [drawPosition, undefined];
    return { orderedDrawPositions, displayOrder: orderedDrawPositions };
  }

  return { orderedDrawPositions: displayOrder, displayOrder };
}
