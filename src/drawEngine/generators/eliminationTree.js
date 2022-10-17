import { generateRange, isPowerOf2 } from '../../utilities';
import { addFinishingRounds } from './addFinishingRounds';
import { buildRound } from './buildRound';

export function treeMatchUps({
  finishingPositionOffset,
  finishingPositionLimit, // optional - limit finishingPositionRanges
  qualifyingRoundNumber, // round at which participants qualify
  qualifyingPositions, // number of positions which qualify
  matchUpType,
  roundLimit,
  idPrefix,
  drawSize,
  isMock,
  uuids,
}) {
  if (
    isNaN(drawSize) ||
    drawSize < 2 ||
    (qualifyingPositions && drawSize <= qualifyingPositions)
  ) {
    return { matchUps: [], roundsCount: 0 };
  }

  if (
    qualifyingPositions &&
    (!isPowerOf2(drawSize) || drawSize % qualifyingPositions)
  ) {
    // if drawSize is NOT a multiple of qualifyingPositions...
    // change drawSize to a multiple of qualifyingPositions that is larger than drawSize
    let requiredDrawSize = qualifyingPositions;
    while (requiredDrawSize < drawSize) requiredDrawSize = 2 * requiredDrawSize;
    drawSize = requiredDrawSize;
  }

  const isValidQualifying =
    !(drawSize % 2) &&
    (!isNaN(qualifyingPositions) || !isNaN(qualifyingRoundNumber)) &&
    (drawSize / qualifyingPositions ===
      Math.round(drawSize / qualifyingPositions) ||
      drawSize / qualifyingRoundNumber ===
        Math.round(drawSize / qualifyingRoundNumber));

  if (!isPowerOf2(drawSize) && !isValidQualifying) {
    return { matchUps: [], roundsCount: 0 };
  }

  const nodes = generateRange(1, parseInt(drawSize) + 1).map(
    (drawPosition) => ({
      drawPosition,
    })
  );

  let roundNodes;
  let matchUps = [];
  let roundNumber = 1;

  ({ roundNodes, matchUps } = buildRound({
    matchUpType,
    roundNumber,
    idPrefix,
    matchUps,
    isMock,
    nodes,
    uuids,
  }));
  roundNumber++;

  roundLimit =
    roundLimit || qualifyingRoundNumber || drawSize / 2 / qualifyingPositions;

  while (roundNodes.length > 1) {
    if (qualifyingPositions && roundNodes.length === qualifyingPositions) {
      roundLimit = roundNumber - 1;
    }

    ({ roundNodes, matchUps } = buildRound({
      nodes: roundNodes,
      matchUpType,
      roundNumber,
      idPrefix,
      matchUps,
      isMock,
      uuids,
    }));
    roundNumber++;
  }

  const roundsCount = roundNumber - 1;

  matchUps = addFinishingRounds({
    finishingPositionOffset,
    finishingPositionLimit,
    roundsCount,
    roundLimit,
    matchUps,
  });

  if (roundLimit) {
    matchUps = matchUps.filter((matchUp) => matchUp.roundNumber <= roundLimit);
  } else {
    // this is the case { qualifyingPositions : 1 }
    // subtract one to account for the last ++
    roundLimit = roundNumber - 1;
  }

  return { drawSize, matchUps, roundsCount, roundLimit };
}

/*
export function feedDrawSize({ opponentCount }) {
  const baseRanges = generateRange(0, 10).map((i) => {
    const positionsBase = Math.pow(2, i);
    const feedPositions = positionsBase - 1;
    const maxByes = positionsBase / 2 - 1;
    const maxPositions = positionsBase + feedPositions;
    const positionRange = { positionsBase, maxPositions, maxByes };
    return positionRange;
  });
  const positionsBase = baseRanges.reduce((p, c) => {
    return opponentCount >= c.positionsBase && opponentCount <= c.maxPositions
      ? c
      : p;
  }, undefined);
  return positionsBase;
}
*/
