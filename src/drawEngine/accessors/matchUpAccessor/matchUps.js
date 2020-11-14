import { makeDeepCopy, numericSort } from '../../../utilities';

export function getMatchUp({ matchUps, matchUpId }) {
  const matchUp = (matchUps || []).reduce((matchUp, current) => {
    return current.matchUpId === matchUpId ? current : matchUp;
  }, undefined);
  return { matchUp };
}

export function publicGetRoundMatchUps(props) {
  return makeDeepCopy(getRoundMatchUps(props));
}

export function getRoundMatchUps({ matchUps = [] }) {
  const roundMatchUpsArray = matchUps
    .reduce((roundNumbers, matchUp) => {
      return !matchUp.roundNumber || roundNumbers.includes(matchUp.roundNumber)
        ? roundNumbers
        : roundNumbers.concat(parseInt(matchUp.roundNumber));
    }, [])
    .sort(numericSort)
    .map(roundNumber => {
      return {
        [roundNumber]: matchUps.filter(
          matchUp => matchUp.roundNumber === roundNumber
        ),
      };
    });

  const finishingRoundMap = matchUps.reduce((mapping, matchUp) => {
    if (!mapping[matchUp.roundNumber])
      mapping[matchUp.roundNumber] = matchUp.finishingRound;
    return mapping;
  }, {});

  const roundMatchUps = Object.assign({}, ...roundMatchUpsArray);
  const roundProfile = Object.assign(
    {},
    ...Object.keys(roundMatchUps).map(round => {
      return { [round]: { matchUpsCount: roundMatchUps[round].length } };
    })
  );

  let roundIndex = 0;
  let feedRoundIndex = 0;
  Object.keys(roundMatchUps).forEach(key => {
    const round = parseInt(key);
    roundProfile[round].drawPositions = roundMatchUps[round]
      .map(matchUp => matchUp.drawPositions)
      .flat();
    roundProfile[round].finishingRound = finishingRoundMap[round];
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

export function getCollectionPositionMatchUps({ matchUps }) {
  const collectionPositionMatchUpsArray = matchUps
    .reduce((collectionPositions, matchUp) => {
      return !matchUp.collectionPosition ||
        collectionPositions.includes(matchUp.collectionPosition)
        ? collectionPositions
        : collectionPositions.concat(matchUp.collectionPosition);
    }, [])
    .map(collectionPosition => {
      return {
        [collectionPosition]: matchUps.filter(
          matchUp => matchUp.collectionPosition === collectionPosition
        ),
      };
    });

  const collectionPositionMatchUps = Object.assign(
    {},
    ...collectionPositionMatchUpsArray
  );
  return { collectionPositionMatchUps };
}
