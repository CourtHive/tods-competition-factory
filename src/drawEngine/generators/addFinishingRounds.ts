import { getRoundMatchUps } from '../accessors/matchUpAccessor/getRoundMatchUps';
import { extractAttributes, generateRange } from '../../utilities';
import { getDevContext } from '../../global/state/globalState';
import { MatchUp } from '../../types/tournamentFromSchema';

type AddFinishingRoundsArgs = {
  finishingPositionOffset?: number;
  finishingPositionLimit?: number;
  positionsFed?: number;
  roundsCount?: number;
  roundLimit?: number;
  matchUps: MatchUp[];
  lucky?: boolean;
  fmlc?: boolean;
};

export function addFinishingRounds({
  finishingPositionOffset = 0,
  finishingPositionLimit,
  positionsFed,
  roundsCount,
  roundLimit,
  matchUps,
  lucky,
  fmlc,
}: AddFinishingRoundsArgs) {
  if (!Array.isArray(matchUps)) return [];

  const { roundProfile, roundNumbers = [] } = getRoundMatchUps({
    interpolate: true, // for structures which do not contain a final round of one matchUps (structure winner)
    matchUps,
  });

  roundsCount = roundsCount || Math.max(...roundNumbers, 0);

  // for qualifying, offset the final round so that qualifyinground is finishingRound
  const finishingRoundOffset = roundLimit ? roundsCount - roundLimit : 0;

  // for QUALIFYING draws the best finishingPosition is equal to the number of matchUps in the final round of the structure
  const minQualifyingPosition =
    finishingRoundOffset &&
    roundProfile?.[roundsCount - finishingRoundOffset]?.matchUpsCount;

  const roundMatchUpsCountArray =
    roundProfile &&
    Object.values(roundProfile).map(extractAttributes('matchUpsCount'));

  // returns a range for array of possible finishing drawPositions
  const finishingRange = (positionRange, winner?) => {
    let minFinishingPosition = Math.min(...positionRange);

    // only modify for qualifying when the minFinishingPosition is 1
    // and when the finishingRange is being calculated for a matchUp winner
    if (minQualifyingPosition && winner && minFinishingPosition === 1) {
      minFinishingPosition = minQualifyingPosition;
    }
    let maxFinishingPosition = Math.max(...positionRange);
    if (finishingPositionLimit && maxFinishingPosition > finishingPositionLimit)
      maxFinishingPosition = finishingPositionLimit;
    return [minFinishingPosition, maxFinishingPosition];
  };

  const roundFinishingData =
    roundProfile &&
    Object.assign(
      {},
      ...roundNumbers.map((roundNumber) => {
        const finishingRound =
          (roundsCount || 0) + 1 - roundNumber - finishingRoundOffset;
        const matchUpsCount = roundProfile[roundNumber].matchUpsCount;
        const finishingData = {
          finishingPositionRange: {},
          finishingRound,
        };

        const upcomingMatchUps = roundMatchUpsCountArray
          ?.slice(roundNumber - 1)
          .reduce((a, b) => a + (b || 0), 0);
        // in the case of FMLC the finishingPositionRange in consolation is not modified after first fed round
        const fmlcException = fmlc && roundNumber !== 1;
        const rangeOffset =
          1 + finishingPositionOffset + (fmlcException ? positionsFed || 0 : 0);
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
    const roundData =
      matchUp.roundNumber && roundFinishingData[matchUp.roundNumber];
    if (devContext && !roundData) console.log({ roundFinishingData, matchUp });
    matchUp.finishingRound = roundData?.finishingRound;
    matchUp.finishingPositionRange = roundData?.finishingPositionRange;
  });

  return matchUps;
}
