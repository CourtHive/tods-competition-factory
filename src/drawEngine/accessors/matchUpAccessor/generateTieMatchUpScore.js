import { validateTieFormat } from '../../governors/matchUpGovernor/tieFormatUtilities';

import { completedMatchUpStatuses } from '../../../constants/matchUpStatusConstants';
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
 * @param {number[]} sideAdjustments - used for projecting the score of a TEAM matchUp; sideAdjustments is only relevant for winCriteria based on matchUp winningSide
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

  const sideTieValues = [0, 0];
  const tieMatchUps = matchUp?.tieMatchUps || [];
  const collectionDefinitions = tieFormat?.collectionDefinitions || [];

  for (const collectionDefinition of collectionDefinitions) {
    const collectionMatchUps = tieMatchUps.filter(
      (matchUp) => matchUp.collectionId === collectionDefinition.collectionId
    );

    // keep track of the values derived from matchUps
    const sideMatchUpValues = [0, 0];
    // will be equivalent to sideMatchUpValues unless there is a collectionValue,
    // in which case the sideMatchUpValues are used in comparision with winCriteria
    let sideCollectionValues = [0, 0];

    const allCollectionMatchUpsCompleted = collectionMatchUps.every((matchUp) =>
      completedMatchUpStatuses.includes(matchUp.matchUpStatus)
    );

    const {
      collectionValueProfile,
      collectionValue,
      matchUpValue,
      winCriteria,
      scoreValue,
      setValue,
    } = collectionDefinition;

    if (matchUpValue) {
      collectionMatchUps.forEach((matchUp) => {
        if (matchUp.winningSide)
          sideMatchUpValues[matchUp.winningSide - 1] += matchUpValue;
      });
    } else if (setValue) {
      collectionMatchUps.forEach((matchUp) => {
        matchUp.score?.sets?.forEach((set) => {
          if (set.winningSide)
            sideMatchUpValues[set.winningSide - 1] += setValue;
        });
      });
    } else if (scoreValue) {
      collectionMatchUps.forEach((matchUp) => {
        matchUp.score?.sets?.forEach((set) => {
          const { side1Score = 0, side2Score = 0 } = set;
          sideMatchUpValues[0] += side1Score;
          sideMatchUpValues[1] += side2Score;
        });
      });
    } else if (Array.isArray(collectionValueProfile)) {
      // this must come last because it will be true for []
      collectionMatchUps.forEach((matchUp) => {
        if (matchUp.winningSide) {
          const collectionPosition = matchUp.collectionPosition;
          const matchUpValue = getCollectionPositionValue({
            collectionDefinition,
            collectionPosition,
          });
          sideMatchUpValues[matchUp.winningSide - 1] += matchUpValue;
        }
      });
    }

    if (collectionValue) {
      const sideWins = [0, 0];
      collectionMatchUps.forEach((matchUp) => {
        if (matchUp.winningSide) sideWins[matchUp.winningSide - 1] += 1;
      });

      let collectionWinningSide;

      if (winCriteria?.aggregateValue) {
        if (
          allCollectionMatchUpsCompleted &&
          sideMatchUpValues[0] !== sideMatchUpValues[1]
        ) {
          collectionWinningSide =
            sideMatchUpValues[0] > sideMatchUpValues[1] ? 1 : 2;
        }
      } else if (winCriteria?.valueGoal) {
        collectionWinningSide = sideMatchUpValues.reduce(
          (winningSide, side, i) => {
            return side >= winCriteria.valueGoal ? i + 1 : winningSide;
          },
          undefined
        );
      } else {
        const winGoal = Math.floor(collectionDefinition.matchUpCount / 2) + 1;

        collectionWinningSide = sideWins.reduce((winningSide, side, i) => {
          return side >= winGoal ? i + 1 : winningSide;
        }, undefined);
      }

      if (collectionWinningSide)
        sideCollectionValues[collectionWinningSide - 1] += collectionValue;
    } else {
      sideCollectionValues = sideMatchUpValues;
    }

    sideCollectionValues.forEach(
      (sideCollectionValue, i) => (sideTieValues[i] += sideCollectionValue)
    );
  }

  const sideScores = sideTieValues.map(
    (sideTieValue, i) => sideTieValue + sideAdjustments[i]
  );

  const set = { side1Score: sideScores[0], side2Score: sideScores[1] };
  const scoreStringSide1 = sideScores.join(separator);
  const scoreStringSide2 = sideScores.slice().reverse().join(separator);

  // now calculate if there is a winningSide
  let winningSide;
  if (tieFormat?.winCriteria) {
    const { valueGoal, aggregateValue } = tieFormat.winCriteria;
    if (valueGoal) {
      const sideThatWon = sideScores
        .map((points, sideIndex) => ({ sideNumber: sideIndex + 1, points }))
        .find(({ points }) => points >= valueGoal);
      winningSide = sideThatWon?.sideNumber;
    } else if (aggregateValue) {
      const allTieMatchUpsCompleted = tieMatchUps.every(
        (matchUp) =>
          completedMatchUpStatuses.includes(matchUp.matchUpStatus) ||
          matchUp.winningSide
      );
      if (allTieMatchUpsCompleted && sideScores[0] !== sideScores[1]) {
        winningSide = sideScores[0] > sideScores[1] ? 1 : 2;
      }
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
