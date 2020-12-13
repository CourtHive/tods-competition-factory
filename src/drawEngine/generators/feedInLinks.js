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
}) {
  const consolationMatchUps = consolationStructure.matchUps;
  const roundsFed = consolationMatchUps.reduce((p, matchUp) => {
    const drawPositions = (matchUp.drawPositions || []).filter((f) => f);
    return drawPositions.length && !p.includes(matchUp.roundNumber)
      ? p.concat(matchUp.roundNumber)
      : p;
  }, []);

  // range excludes final round which is final matchUp
  const links = generateRange(1 + roundOffset, roundsCount + 1 + roundOffset)
    .map((roundNumber) => {
      const feedProfile = roundNumber % 2 ? TOP_DOWN : BOTTOM_UP;

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
          roundNumber: targetRound,
          structureId: consolationStructure.structureId,
        },
      };
      return roundsFed.includes(targetRound) ? link : undefined;
    })
    .filter((f) => f);

  return links;
}
