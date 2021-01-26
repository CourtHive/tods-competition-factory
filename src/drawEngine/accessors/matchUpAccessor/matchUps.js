// import { numericSort } from '../../../utilities';

export function getMatchUp({ matchUps, matchUpId }) {
  const matchUp = (matchUps || []).reduce((matchUp, current) => {
    return current.matchUpId === matchUpId ? current : matchUp;
  }, undefined);
  return { matchUp };
}

/*
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
    ...Object.keys(roundMatchUps).map((round) => {
      return { [round]: { matchUpsCount: roundMatchUps[round]?.length } };
    })
  );

  let roundIndex = 0;
  let feedRoundIndex = 0;
  Object.keys(roundMatchUps).forEach((key) => {
    const round = parseInt(key);
    roundProfile[round].drawPositions = roundMatchUps[round]
      .map((matchUp) => matchUp.drawPositions)
      .flat();
    roundProfile[round].finishingRound = finishingRoundMap[round];
    roundProfile[round].finishingPositionRange =
      roundMatchUps[round][0].finishingPositionRange;
    if (
      roundProfile[round + 1] &&
      roundProfile[round + 1].matchUpsCount ===
        roundProfile[round].matchUpsCount
    ) {
      roundProfile[round + 1].feedRound = true;
      roundProfile[round + 1].feedRoundIndex = feedRoundIndex;
      roundProfile[round].preFeedRound = true;
      feedRoundIndex += 1;
    }
    if (!roundProfile[round].feedRound) {
      roundProfile[round].roundIndex = roundIndex;
      roundIndex += 1;
    }
  });
  return { roundMatchUps, roundProfile };
}
*/

export function getCollectionPositionMatchUps({ matchUps }) {
  const collectionPositionMatchUpsArray = matchUps
    .reduce((collectionPositions, matchUp) => {
      return !matchUp.collectionPosition ||
        collectionPositions.includes(matchUp.collectionPosition)
        ? collectionPositions
        : collectionPositions.concat(matchUp.collectionPosition);
    }, [])
    .map((collectionPosition) => {
      return {
        [collectionPosition]: matchUps.filter(
          (matchUp) => matchUp.collectionPosition === collectionPosition
        ),
      };
    });

  const collectionPositionMatchUps = Object.assign(
    {},
    ...collectionPositionMatchUpsArray
  );
  return { collectionPositionMatchUps };
}
