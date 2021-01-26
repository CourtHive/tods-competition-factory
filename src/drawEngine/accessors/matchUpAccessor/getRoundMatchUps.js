import { chunkArray, numericSort } from '../../../utilities';

export function getRoundMatchUps({ matchUps = [] }) {
  // create an array of arrays of matchUps grouped by roundNumber
  const roundMatchUpsArray = matchUps
    .reduce((roundNumbers, matchUp) => {
      return !matchUp.roundNumber || roundNumbers.includes(matchUp.roundNumber)
        ? roundNumbers
        : roundNumbers.concat(parseInt(matchUp.roundNumber));
    }, [])
    .sort(numericSort)
    .map((roundNumber) => {
      return {
        [roundNumber]: matchUps
          .filter((matchUp) => matchUp.roundNumber === roundNumber)
          .sort((a, b) => numericSort(a.roundPosition, b.roundPosition)),
      };
    });

  // calculate the finishing Round for each roundNumber
  const finishingRoundMap = matchUps.reduce((mapping, matchUp) => {
    if (!mapping[matchUp.roundNumber])
      mapping[matchUp.roundNumber] = matchUp.finishingRound;
    return mapping;
  }, {});

  // convert roundMatchUpsArray into an object with roundNumber keys
  const roundMatchUps = Object.assign({}, ...roundMatchUpsArray);

  // create a profle object with roundNubmer keys
  // provides details for each round, including:
  //  - matchUpsCount: total number of matchUps
  //  - preFeedRound: whether the round is followed by a feedRound
  //  - feedRound: whether round matchUps have fed partitipants
  //  - roundIndex & feedRoundIndex: index relative to round type
  //  - finishingRound: reverse count of rounds. Final is finishingRound #1
  const roundProfile = Object.assign(
    {},
    ...Object.keys(roundMatchUps).map((roundNumber) => {
      return {
        [roundNumber]: { matchUpsCount: roundMatchUps[roundNumber]?.length },
      };
    })
  );

  let roundIndex = 0;
  let feedRoundIndex = 0;
  const roundNumbers = Object.keys(roundMatchUps).map((key) => parseInt(key));
  roundNumbers.forEach((roundNumber) => {
    const currentRoundMatchUps = roundMatchUps[roundNumber].sort(
      (a, b) => a.roundPosition - b.roundPosition
    );
    const currentRoundDrawPositions = currentRoundMatchUps
      .map((matchUp) => matchUp.drawPositions)
      .flat();
    if (roundNumber === 1 || !roundProfile[roundNumber - 1]) {
      roundProfile[roundNumber].drawPositions = currentRoundDrawPositions.sort(
        numericSort
      );
    } else {
      const priorRoundDrawPositions =
        roundProfile[roundNumber - 1].drawPositions;
      const chunkFactor =
        priorRoundDrawPositions.length / currentRoundDrawPositions.length;
      const priorRoundDrawPositionChunks = chunkArray(
        priorRoundDrawPositions,
        chunkFactor
      );
      // insures that drawPositions are returned in top to bottom order
      const roundDrawPositions = currentRoundMatchUps
        .map((matchUp) => {
          const { roundPosition, drawPositions } = matchUp;
          if (!roundPosition) return drawPositions;
          const filteredDrawPositions = drawPositions.filter((f) => f);
          if (!filteredDrawPositions.length) return [undefined, undefined];
          if (filteredDrawPositions.length === 2)
            return drawPositions.sort(numericSort);
          if (!priorRoundDrawPositions.includes(filteredDrawPositions[0]))
            return [filteredDrawPositions[0], undefined];
          const targetChunkIndex = (roundPosition - 1) * 2;
          const targetChunks = priorRoundDrawPositionChunks.slice(
            targetChunkIndex,
            targetChunkIndex + 2
          );
          const orderedPositions = targetChunks.map((chunk) => {
            const drawPositionInChunk = drawPositions.find((drawPosition) =>
              chunk.includes(drawPosition)
            );
            return drawPositionInChunk;
          });
          return orderedPositions;
        })
        .flat();
      roundProfile[roundNumber].drawPositions = roundDrawPositions;
    }
    roundProfile[roundNumber].finishingRound = finishingRoundMap[roundNumber];
    roundProfile[roundNumber].finishingPositionRange =
      roundMatchUps[roundNumber][0].finishingPositionRange;
    if (
      roundProfile[roundNumber + 1] &&
      roundProfile[roundNumber + 1].matchUpsCount ===
        roundProfile[roundNumber].matchUpsCount
    ) {
      roundProfile[roundNumber + 1].feedRound = true;
      roundProfile[roundNumber + 1].feedRoundIndex = feedRoundIndex;
      roundProfile[roundNumber].preFeedRound = true;
      feedRoundIndex += 1;
    }
    if (!roundProfile[roundNumber].feedRound) {
      roundProfile[roundNumber].roundIndex = roundIndex;
      roundIndex += 1;
    }
  });
  return { roundMatchUps, roundProfile };
}
