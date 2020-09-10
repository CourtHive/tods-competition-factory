import { findMatchUp } from '../../../drawEngine/getters/getMatchUps';
import { SUCCESS } from '../../../constants/resultConstants';

export function updateTieMatchUpScore({ drawDefinition, matchUpId }) {
  if (!drawDefinition) return { error: 'Missing drawDefinition' };
  if (!matchUpId) return { error: 'Missing matchUpId' };
  const matchUp = findMatchUp({ drawDefinition, matchUpId });
  if (!matchUp) return { error: 'matchUp Not Found' };
  const score = calcTieMatchUpScore({ matchUp });
  matchUp.score = score;
  return SUCCESS;
}

export function calcTieMatchUpScore({ matchUp, separator = '-' }) {
  const sidePoints = [0, 0];
  const tieMatchUps = matchUp?.tieMatchUps || [];
  const collectionDefinitions = matchUp?.tieFormat?.collectionDefinitions || [];
  collectionDefinitions.forEach(collectionDefinition => {
    const collectionMatchUps = tieMatchUps.filter(
      matchUp => matchUp.collectionId === collectionDefinition.collectionId
    );

    if (collectionDefinition.matchUpValue) {
      const matchUpValue = collectionDefinition.matchUpValue;
      collectionMatchUps.forEach(matchUp => {
        if (matchUp.winningSide)
          sidePoints[matchUp.winningSide - 1] += matchUpValue;
      });
    } else if (collectionDefinition.collectionValue) {
      const sideWins = [0, 0];
      const winGoal =
        Math.floor(collectionDefinition.matchUpCount / 2).floor + 1;
      collectionMatchUps.forEach(matchUp => {
        if (matchUp.winningSide) sideWins[matchUp.winningSide - 1] += 1;
      });
      const collectionWinningSide = sideWins.reduce((winningSide, side) => {
        return side >= winGoal ? side + 1 : winningSide;
      }, undefined);
      if (collectionWinningSide)
        sidePoints[collectionWinningSide] +=
          collectionDefinition.collectionValue;
    } else if (collectionDefinition.collectionValueProfile) {
      collectionMatchUps.forEach(matchUp => {
        if (matchUp.winningSide) {
          const collectionPosition = matchUp.collectionPosition;
          const matchUpValue = getCollectionPositionValue({
            collectionDefinition,
            collectionPosition,
          });
          sidePoints[matchUp.winningSide - 1] += matchUpValue;
        }
      });
    }
  });

  const score = sidePoints.join(` ${separator} `);
  return score;
}

function getCollectionPositionValue({
  collectionDefinition,
  collectionPosition,
}) {
  const collectionValueProfile =
    collectionDefinition.collectionValueProfile || [];
  const matchUpValue = collectionValueProfile.reduce((value, profile) => {
    return profile.collectionPosition === collectionPosition
      ? profile.matchUpValue
      : value;
  }, 0);
  return matchUpValue;
}
