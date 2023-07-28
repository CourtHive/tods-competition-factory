import { getRoundMatchUps } from '../accessors/matchUpAccessor/getRoundMatchUps';
import { getDevContext } from '../../global/state/globalState';
import { generateRange } from '../../utilities';

import { MISSING_MATCHUPS } from '../../constants/errorConditionConstants';

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
  if (!Array.isArray(matchUps)) return { error: MISSING_MATCHUPS };
  const { roundProfile, roundNumbers } = getRoundMatchUps({
    interpolate: true, // for structures which do not contain a final round of one matchUps (structure winner)
    matchUps,
  });

  roundsCount = roundsCount || Math.max(...roundNumbers);

  // for qualifying, offset the final round so that qualifyinground is finishingRound
  const finishingRoundOffset = roundLimit ? roundsCount - roundLimit : 0;

  // for QUALIFYING draws the best finishingPosition is equal to the number of matchUps in the final round of the structure
  const minQualifyingPosition =
    finishingRoundOffset &&
    roundProfile[roundsCount - finishingRoundOffset]?.matchUpsCount;

  // array of # of matchUps (value) for eaach round (index)
  const roundMatchUpsCountArray = Object.values(roundProfile).map(
    ({ matchUpsCount }) => matchUpsCount
  );

  // returns a range for array of possible finishing drawPositions
  const finishingRange = (positionRange, winner) => {
    let minFinishingPosition = Math.min(...positionRange);

    // only modify for qualifying when the minFinishingPosition is 1
    // and when the finishingRange is being calculated for a matchUp winner
    if (minQualifyingPosition && winner && minFinishingPosition === 1) {
      minFinishingPosition = minQualifyingPosition;
    }
    let maxFinishingPosition = Math.max(...positionRange);
    if (maxFinishingPosition > finishingPositionLimit)
      maxFinishingPosition = finishingPositionLimit;
    return [minFinishingPosition, maxFinishingPosition];
  };

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
      const winner = finishingRange(positionRange.slice(0, slicer), true);
      finishingData.finishingPositionRange = { loser, winner };

      return { [roundNumber]: finishingData };
    })
  );

  const devContext = getDevContext({ finishingRound: true });
  matchUps.filter(Boolean).forEach((matchUp) => {
    const roundData = roundFinishingData[matchUp.roundNumber];
    if (devContext && !roundData) console.log({ roundFinishingData, matchUp });
    matchUp.finishingRound = roundData?.finishingRound;
    matchUp.finishingPositionRange = roundData?.finishingPositionRange;
  });

  return matchUps;
}
