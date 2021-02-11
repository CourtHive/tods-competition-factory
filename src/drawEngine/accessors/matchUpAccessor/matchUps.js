export function getMatchUp({ matchUps, matchUpId }) {
  const matchUp = (matchUps || []).reduce((matchUp, current) => {
    return current.matchUpId === matchUpId ? current : matchUp;
  }, undefined);
  return { matchUp };
}

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
