import { isConvertableInteger } from '../../utilities/math';
import { addFinishingRounds } from './addFinishingRounds';
import { generateRange } from '../../utilities';
import { buildRound } from './buildRound';

export function luckyDraw({
  qualifyingRoundNumber, // round at which participants qualify
  finishingPositionOffset,
  qualifyingPositions, // number of positions which qualify
  matchUpType,
  roundLimit,
  idPrefix,
  drawSize,
  isMock,
  uuids,
}) {
  if (!isConvertableInteger(drawSize) || drawSize < 2) {
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
    if (qualifyingPositions && roundNodes.length === qualifyingPositions)
      roundLimit = roundNumber - 1;
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
    roundsCount,
    roundLimit,
    matchUps,
  });

  if (roundLimit) {
    matchUps = matchUps.filter((matchUp) => matchUp.roundNumber <= roundLimit);
  }

  return { matchUps, roundsCount, roundLimit };
}
