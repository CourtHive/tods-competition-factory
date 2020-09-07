import { makeDeepCopy } from 'src/utilities';

export function getMatchUp({matchUps, matchUpId}) {
  const matchUp = (matchUps || []).reduce((matchUp, current) => {
    return current.matchUpId === matchUpId ? current : matchUp;
  }, undefined);
  return { matchUp };
}

export function publicGetRoundMatchUps(props) { return makeDeepCopy(getRoundMatchUps(props)); }

export function getRoundMatchUps({matchUps=[]}) {
  const roundMatchUpsArray = matchUps.reduce((roundNumbers, matchUp) => {
    return !matchUp.roundNumber || roundNumbers.includes(matchUp.roundNumber)
      ? roundNumbers
      : roundNumbers.concat(matchUp.roundNumber);
  }, []).map(roundNumber => {
    return { [roundNumber]: matchUps.filter(matchUp => matchUp.roundNumber === roundNumber) };
  });

  const roundMatchUps = Object.assign({}, ...roundMatchUpsArray);
  return { roundMatchUps };
}

export function getCollectionPositionMatchUps({matchUps}) {
  const collectionPositionMatchUpsArray = matchUps.reduce((collectionPositions, matchUp) => {
    return !matchUp.collectionPosition || collectionPositions.includes(matchUp.collectionPosition)
      ? collectionPositions
      : collectionPositions.concat(matchUp.collectionPosition);
  }, []).map(collectionPosition =>  {
    return { [collectionPosition]: matchUps.filter(matchUp => matchUp.collectionPosition === collectionPosition) };
  });

  const collectionPositionMatchUps = Object.assign({}, ...collectionPositionMatchUpsArray);
  return { collectionPositionMatchUps };
}