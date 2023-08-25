import { MatchUp } from '../../types/tournamentFromSchema';
import { generateRange, isPowerOf2 } from '../../utilities';
import { addFinishingRounds } from './addFinishingRounds';
import { buildRound } from './buildRound';

type TreeMatchUpsArgs = {
  finishingPositionOffset?: number;
  finishingPositionLimit?: number;
  qualifyingRoundNumber?: number;
  qualifyingPositions?: number;
  matchUpType?: string;
  roundLimit?: number;
  idPrefix?: string;
  drawSize: number;
  isMock?: boolean;
  uuids?: string[];
};

type TreeMatchUpsReturn = {
  matchUps: MatchUp[];
  roundsCount: number;
  roundLimit?: number;
  drawSize?: number;
};

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
}: TreeMatchUpsArgs): TreeMatchUpsReturn {
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
    qualifyingRoundNumber &&
    qualifyingPositions &&
    !(drawSize % 2) &&
    (!isNaN(qualifyingPositions) || !isNaN(qualifyingRoundNumber)) &&
    (drawSize / qualifyingPositions ===
      Math.round(drawSize / qualifyingPositions) ||
      drawSize / qualifyingRoundNumber ===
        Math.round(drawSize / qualifyingRoundNumber));

  if (!isPowerOf2(drawSize) && !isValidQualifying) {
    return { matchUps: [], roundsCount: 0 };
  }

  const nodes = generateRange(1, drawSize + 1).map((drawPosition) => ({
    drawPosition,
  }));

  let roundNodes;
  let matchUps: MatchUp[] = [];
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
    roundLimit ||
    qualifyingRoundNumber ||
    (qualifyingPositions ? drawSize / 2 / qualifyingPositions : undefined);

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

  const roundsCount = roundNumber - 1; // because roundNumber was incremented at the end of the while loop

  matchUps = addFinishingRounds({
    finishingPositionOffset,
    finishingPositionLimit,
    roundsCount,
    roundLimit,
    matchUps,
  });

  if (!roundLimit) {
    // this is the case { qualifyingPositions : 1 }
    // subtract one to account for the last ++
    roundLimit = roundNumber - 1;
  } else {
    matchUps = matchUps.filter(
      (matchUp) => roundLimit && (matchUp.roundNumber || 0) <= roundLimit
    );
  }

  return { drawSize, matchUps, roundsCount, roundLimit };
}
