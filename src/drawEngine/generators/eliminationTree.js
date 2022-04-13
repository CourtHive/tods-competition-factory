import { generateRange, isPowerOf2 } from '../../utilities';
import { addFinishingRounds } from './addFinishingRounds';
import { buildRound } from './buildRound';

export function treeMatchUps({
  qualifyingRoundNumber, // round at which participants qualify
  finishingPositionOffset,
  finishingPositionLimit, // optional - limit finishingPositionRanges
  qualifyingPositions, // number of positions which qualify
  matchUpType,
  roundLimit,
  idPrefix,
  drawSize,
  isMock,
  uuids,
}) {
  if (isNaN(drawSize) || !isPowerOf2(drawSize) || drawSize < 2) {
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
    roundNumber,
    matchUpType,
    idPrefix,
    matchUps,
    isMock,
    nodes,
    uuids,
  }));
  roundNumber++;

  roundLimit = roundLimit || qualifyingRoundNumber;
  while (roundNodes.length > 1) {
    if (qualifyingPositions && roundNodes.length === qualifyingPositions) {
      roundLimit = roundNumber - 1;
    }

    ({ roundNodes, matchUps } = buildRound({
      nodes: roundNodes,
      roundNumber,
      matchUpType,
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
  }

  return { matchUps, roundsCount, roundLimit };
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
