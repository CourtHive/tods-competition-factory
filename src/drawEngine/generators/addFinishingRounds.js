import { generateRange } from '../../utilities';

export function addFinishingRounds({
  finishingPositionOffset = 0,
  positionsFed,
  roundsCount,
  roundLimit,
  matchUps,
  fmlc,
}) {
  // object containing # of matchUps (value) for each round (attribute)
  const roundMatchCounts = matchUps.reduce((p, matchUp) => {
    p[matchUp.roundNumber] = (p[matchUp.roundNumber] || 0) + 1;
    return p;
  }, {});

  // array of # of matchUps (value) for eaach round (index)
  const roundMatchCountArray = Object.values(roundMatchCounts);

  // returns a range for array of possible finishing drawPositions
  const finishingRange = (drawPositions) => [
    Math.min(...drawPositions),
    Math.max(...drawPositions),
  ];

  // for qualifying, offset the final round so that qualifyinground is finishingRound
  const finishingRoundOffset = roundLimit ? roundsCount - roundLimit : 0;

  matchUps.forEach((matchUp) => {
    matchUp.finishingRound =
      roundsCount + 1 - matchUp.roundNumber - finishingRoundOffset;

    // in the case of FMLC the finishingPositionRange in consolation is not modified after first fed round
    const fmlcException = fmlc && matchUp.roundNumber !== 1;
    const rangeOffset =
      1 + finishingPositionOffset + (fmlcException ? positionsFed : 0);

    const currentMatchUps = roundMatchCounts[matchUp.roundNumber];

    const upcomingMatchUps = roundMatchCountArray
      .slice(matchUp.roundNumber - 1)
      .reduce((a, b) => a + b, 0);

    const finalPosition = 1;
    const finishingPositionRange = generateRange(
      rangeOffset,
      upcomingMatchUps + rangeOffset + finalPosition
    );

    const slicer = upcomingMatchUps + finalPosition - currentMatchUps;
    const loser = finishingRange(finishingPositionRange.slice(slicer));
    const winner = finishingRange(finishingPositionRange.slice(0, slicer));
    matchUp.finishingPositionRange = { loser, winner };
  });

  return matchUps;
}
