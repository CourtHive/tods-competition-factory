import { getRoundMatchUps } from '../accessors/matchUpAccessor/getRoundMatchUps';
import { generateRange } from '../../utilities';

export function addFinishingRounds({
  finishingPositionOffset = 0,
  finishingPositionLimit,
  positionsFed,
  roundsCount,
  roundLimit,
  matchUps,
  lucky,
  fmlc,
}) {
  const { roundProfile, roundNumbers } = getRoundMatchUps({ matchUps });

  // array of # of matchUps (value) for eaach round (index)
  const roundMatchUpsCountArray = Object.values(roundProfile).map(
    ({ matchUpsCount }) => matchUpsCount
  );

  // returns a range for array of possible finishing drawPositions
  const finishingRange = (positionRange) => {
    let maxFinishingPosition = Math.max(...positionRange);
    if (maxFinishingPosition > finishingPositionLimit)
      maxFinishingPosition = finishingPositionLimit;
    return [Math.min(...positionRange), maxFinishingPosition];
  };

  // for qualifying, offset the final round so that qualifyinground is finishingRound
  const finishingRoundOffset = roundLimit ? roundsCount - roundLimit : 0;

  const roundFinishingData = Object.assign(
    {},
    ...roundNumbers.map((roundNumber) => {
      const finishingRound =
        roundsCount + 1 - roundNumber - finishingRoundOffset;
      const matchUpsCount = roundProfile[roundNumber].matchUpsCount;
      const finishingData = { finishingRound };

      const upcomingMatchUps = roundMatchUpsCountArray
        .slice(roundNumber - 1)
        .reduce((a, b) => a + b, 0);
      // in the case of FMLC the finishingPositionRange in consolation is not modified after first fed round
      const fmlcException = fmlc && roundNumber !== 1;
      const rangeOffset =
        1 + finishingPositionOffset + (fmlcException ? positionsFed : 0);
      const finalPosition = 1;
      const positionRange = generateRange(
        rangeOffset,
        lucky
          ? rangeOffset + matchUpsCount * 2
          : upcomingMatchUps + rangeOffset + finalPosition
      );
      const slicer = upcomingMatchUps + finalPosition - matchUpsCount;
      const loser = finishingRange(positionRange.slice(slicer));
      const winner = finishingRange(positionRange.slice(0, slicer));
      finishingData.finishingPositionRange = { loser, winner };

      return { [roundNumber]: finishingData };
    })
  );

  matchUps.forEach((matchUp) => {
    const roundData = roundFinishingData[matchUp.roundNumber];
    matchUp.finishingRound = roundData.finishingRound;
    matchUp.finishingPositionRange = roundData.finishingPositionRange;
  });

  return matchUps;
}
