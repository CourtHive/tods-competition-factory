import { generateRange } from '../../utilities';
import {
  BOTTOM_UP,
  TOP_DOWN,
  LOSER,
} from '../../constants/drawDefinitionConstants';

export function feedInLinks({
  mainStructure,
  consolationStructure,
  roundsCount,
  roundOffset = 0,
  feedPolicy,
}) {
  const consolationMatchUps = consolationStructure.matchUps;
  const roundsFed = consolationMatchUps.reduce((p, matchUp) => {
    const drawPositions = (matchUp.drawPositions || []).filter((f) => f);
    return drawPositions.length && !p.includes(matchUp.roundNumber)
      ? p.concat(matchUp.roundNumber)
      : p;
  }, []);

  const roundGroupedOrder = [
    undefined, // complete round TOP_DOWN
    undefined, // complete round BOTTOM_UP
    [2, 1], // 2nd half TOP_DOWN, 1st half TOP_DOWN
    [3, 4, 1, 2], // 3rd Qtr BOTTOM_UP, 4th Qtr BOTTOM_UP, 1st Qtr BOTTOM_UP, 2nd Qtr BOTTOM_UP
    [4, 3, 2, 1], // 4th Qtr TOP_DOWN, 3rd Qtr TOP_DOWN, 2nd Qtr TOP_DOWN, 1st Qtr TOP_DOWN
    [1], // same as undefined, complete round BOTTOM_UP
  ];

  // range excludes final round which is final matchUp
  const links = generateRange(1 + roundOffset, roundsCount + 1 + roundOffset)
    .map((roundNumber) => {
      const feedProfile = feedPolicy?.oscillation
        ? roundNumber % 2
          ? TOP_DOWN
          : BOTTOM_UP
        : roundNumber === 1
        ? TOP_DOWN
        : BOTTOM_UP;

      // after first two rounds of target feed, matchUps are every other round
      const targetRound =
        roundNumber - roundOffset <= 2
          ? roundNumber - roundOffset
          : (roundNumber - roundOffset - 2) * 2 + 2;

      const link = {
        linkType: LOSER,
        source: {
          roundNumber,
          structureId: mainStructure.structureId,
        },
        target: {
          feedProfile,
          groupedOrder: roundGroupedOrder[roundNumber - 1],
          roundNumber: targetRound,
          structureId: consolationStructure.structureId,
        },
      };
      return roundsFed.includes(targetRound) ? link : undefined;
    })
    .filter((f) => f);

  return links;
}
