import { generateRange } from '../../utilities';
import {
  BOTTOM_UP,
  TOP_DOWN,
  LOSER,
  FIRST_MATCHUP,
} from '../../constants/drawDefinitionConstants';

export function feedInLinks({
  mainStructure,
  consolationStructure,
  roundsCount,
  roundOffset = 0,
  feedPolicy,
  fmlc,
}) {
  const consolationMatchUps = consolationStructure.matchUps;
  const roundsFed = consolationMatchUps.reduce((p, matchUp) => {
    const drawPositions = (matchUp.drawPositions || []).filter((f) => f);
    return drawPositions.length && !p.includes(matchUp.roundNumber)
      ? p.concat(matchUp.roundNumber)
      : p;
  }, []);

  const roundGroupedOrder = feedPolicy?.roundGroupedOrder || [];
  const roundFeedProfiles = feedPolicy?.roundFeedProfiles;

  // range excludes final round which is final matchUp
  const links = generateRange(1 + roundOffset, roundsCount + 1 + roundOffset)
    .map((roundNumber) => {
      const feedProfile =
        roundFeedProfiles && roundFeedProfiles[roundNumber - 1]
          ? roundFeedProfiles[roundNumber - 1]
          : roundNumber % 2
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
      if (roundNumber === 2 && fmlc) link.linkCondition = FIRST_MATCHUP;
      return roundsFed.includes(targetRound) ? link : undefined;
    })
    .filter((f) => f);

  return links;
}
