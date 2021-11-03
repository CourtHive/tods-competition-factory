import { validateTieFormat } from '../../governors/matchUpGovernor/tieFormatUtilities';

import {
  INVALID_VALUES,
  MISSING_MATCHUP,
  MISSING_TIE_FORMAT,
} from '../../../constants/errorConditionConstants';

/**
 * Calculates the number of wins per side and winningSide. When provided with `sideAdjustments`
 * will calculate prjected score and winningSide which is necessary for checking validity of score
 *
 * @param {object} matchUp - TODS matchUp: { matchUpType: 'TEAM', tieMatchUps: [] }
 * @param {object} tieFormat - TODS tieFormat which defines the winCriteria for determining a winningSide
 * @param {string} separator - used to separate the two side scores in a scoreString
 * @param {number[]} sideAdjustments - used for projecting the score of a TEAM matchUp
 *
 * @returns scoreObject: { sets, winningSide, scoreStringSide1, scoreStringSide 2 }
 */
export function generateTieMatchUpScore({
  sideAdjustments = [0, 0],
  separator = '-',
  tieFormat,
  matchUp,
}) {
  if (
    !Array.isArray(sideAdjustments) ||
    sideAdjustments.length !== 2 ||
    isNaN(sideAdjustments.reduce((a, b) => a + b))
  ) {
    return { error: INVALID_VALUES };
  }

  if (!matchUp) return { error: MISSING_MATCHUP };
  tieFormat = matchUp.tieFormat || tieFormat;
  if (!tieFormat) return { error: MISSING_TIE_FORMAT };

  const result = validateTieFormat({ tieFormat });
  if (!result.valid) return { error: INVALID_VALUES, errors: result.errors };

  const sideTieValue = [0, 0];
  const tieMatchUps = matchUp?.tieMatchUps || [];
  const collectionDefinitions = tieFormat?.collectionDefinitions || [];

  for (const collectionDefinition of collectionDefinitions) {
    const collectionMatchUps = tieMatchUps.filter(
      (matchUp) => matchUp.collectionId === collectionDefinition.collectionId
    );

    const sideCollectionValues = [0, 0];

    const {
      collectionValueProfile,
      collectionValue,
      matchUpValue,
      winCriteria,
    } = collectionDefinition;

    if (matchUpValue) {
      collectionMatchUps.forEach((matchUp) => {
        if (matchUp.winningSide)
          sideCollectionValues[matchUp.winningSide - 1] += matchUpValue;
      });
    } else if (Array.isArray(collectionValueProfile)) {
      collectionMatchUps.forEach((matchUp) => {
        if (matchUp.winningSide) {
          const collectionPosition = matchUp.collectionPosition;
          const matchUpValue = getCollectionPositionValue({
            collectionDefinition,
            collectionPosition,
          });
          sideCollectionValues[matchUp.winningSide - 1] += matchUpValue;
        }
      });
    }

    if (collectionValue) {
      if (winCriteria?.aggregateValue) {
        //
      } else if (winCriteria?.valueGoal) {
        //
      } else {
        const sideWins = [0, 0];
        const winGoal = Math.floor(collectionDefinition.matchUpCount / 2) + 1;

        collectionMatchUps.forEach((matchUp) => {
          if (matchUp.winningSide) sideWins[matchUp.winningSide - 1] += 1;
        });

        const collectionWinningSide = sideWins.reduce(
          (winningSide, side, i) => {
            return side >= winGoal ? i + 1 : winningSide;
          },
          undefined
        );

        if (collectionWinningSide)
          sideCollectionValues[collectionWinningSide - 1] += collectionValue;
      }
    }

    sideCollectionValues.forEach(
      (sideCollectionValue, i) => (sideTieValue[i] += sideCollectionValue)
    );
  }

  const sideScores = sideTieValue.map(
    (sideTieValue, i) => sideTieValue + sideAdjustments[i]
  );

  const set = { side1Score: sideScores[0], side2Score: sideScores[1] };
  const scoreStringSide1 = sideScores.join(separator);
  const scoreStringSide2 = sideScores.slice().reverse().join(separator);

  // now calculate if there is a winningSide
  let winningSide;
  if (tieFormat) {
    const valueGoal = tieFormat.winCriteria?.valueGoal;
    if (valueGoal) {
      const sideThatWon = sideScores
        .map((points, sideIndex) => ({ sideNumber: sideIndex + 1, points }))
        .find(({ points }) => points >= valueGoal);
      winningSide = sideThatWon?.sideNumber;
    }
  }

  return {
    scoreStringSide1,
    scoreStringSide2,
    winningSide,
    set,
  };
}

function getCollectionPositionValue({
  collectionDefinition,
  collectionPosition,
}) {
  const collectionValueProfile =
    collectionDefinition.collectionValueProfile || [];
  const profile = collectionValueProfile?.find(
    (profile) => profile.collectionPosition === collectionPosition
  );
  return profile?.matchUpValue;
}
