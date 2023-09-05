import { resolveTieFormat } from '../../../matchUpEngine/governors/tieFormatGovernor/getTieFormat/resolveTieFormat';
import { validateTieFormat } from '../../../matchUpEngine/governors/tieFormatGovernor/tieFormatUtilities';
import { tallyParticipantResults } from '../../../matchUpEngine/getters/roundRobinTally/roundRobinTally';
import { completedMatchUpStatuses } from '../../../constants/matchUpStatusConstants';
import { evaluateCollectionResult } from './evaluateCollectionResult';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { getGroupValueGroups } from '../getGroupValueGroups';

import {
  INVALID_VALUES,
  MISSING_MATCHUP,
  MISSING_TIE_FORMAT,
} from '../../../constants/errorConditionConstants';

import { MatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { ResultType } from '../../../global/functions/decorateResult';
import { HydratedMatchUp } from '../../../types/hydrated';
import {
  DrawDefinition,
  Event,
  Structure,
  TieFormat,
} from '../../../types/tournamentFromSchema';

/**
 * Calculates the number of wins per side and winningSide. When provided with `sideAdjustments`
 * will calculate prjected score and winningSide which is necessary for checking validity of score
 */

type TieMatchUpScore = {
  scoreStringSide1?: string;
  scoreStringSide2?: string;
  winningSide?: number;
  set?: any;
};

type GenerateTieMatchUpScoreArgs = {
  sideAdjustments?: [number, number];
  drawDefinition?: DrawDefinition;
  matchUpsMap?: MatchUpsMap;
  matchUp: HydratedMatchUp;
  structure?: Structure;
  tieFormat?: TieFormat;
  separator?: string;
  event?: Event;
};

export function generateTieMatchUpScore(
  params: GenerateTieMatchUpScoreArgs
): TieMatchUpScore & ResultType {
  const {
    sideAdjustments = [0, 0], // currently unused?
    separator = '-',
    drawDefinition,
    matchUpsMap,
    structure,
    matchUp,
    event,
  } = params;

  if (
    !Array.isArray(sideAdjustments) ||
    sideAdjustments.length !== 2 ||
    isNaN(sideAdjustments.reduce((a, b) => a + b))
  ) {
    return { error: INVALID_VALUES };
  }

  if (!matchUp) return { error: MISSING_MATCHUP };
  const tieFormat =
    resolveTieFormat({ matchUp, drawDefinition, structure, event })
      ?.tieFormat || params?.tieFormat;

  if (!tieFormat) return { error: MISSING_TIE_FORMAT };

  const result = validateTieFormat({ tieFormat });
  if (result.error) return result;

  const collectionDefinitions = tieFormat?.collectionDefinitions || [];
  const tieMatchUps = matchUp?.tieMatchUps || [];
  const sideTieValues = [0, 0];

  const { groupValueGroups, groupValueNumbers } =
    getGroupValueGroups(tieFormat);

  for (const collectionDefinition of collectionDefinitions) {
    evaluateCollectionResult({
      collectionDefinition,
      groupValueNumbers,
      groupValueGroups,
      sideTieValues,
      tieMatchUps,
    });
  }

  // process each relevant group for groupValue
  for (const groupNumber of groupValueNumbers) {
    const group = groupValueGroups[groupNumber];
    const {
      allGroupMatchUpsCompleted,
      matchUpCount,
      winCriteria,
      groupValue,
      sideWins,
      values,
    } = group;

    let groupWinningSide;

    if (winCriteria?.aggregateValue) {
      if (allGroupMatchUpsCompleted && values[0] !== values[1]) {
        groupWinningSide = values[0] > values[1] ? 1 : 2;
      }
    } else if (winCriteria?.valueGoal) {
      groupWinningSide = values.reduce((winningSide, side, i) => {
        return side >= winCriteria.valueGoal ? i + 1 : winningSide;
      }, undefined);
    } else {
      const winGoal = Math.floor(matchUpCount / 2) + 1;
      groupWinningSide = sideWins.reduce((winningSide, side, i) => {
        return side >= winGoal ? i + 1 : winningSide;
      }, undefined);
    }

    if (groupWinningSide) {
      sideTieValues[groupWinningSide - 1] += groupValue;
    }
  }

  const sideScores = sideTieValues.map(
    (sideTieValue, i) => sideTieValue + sideAdjustments[i]
  );

  const set = {
    side1Score: sideScores[0],
    side2Score: sideScores[1],
    winningSide: undefined,
  };
  const scoreStringSide1 = sideScores.join(separator);
  const scoreStringSide2 = sideScores.slice().reverse().join(separator);

  // now calculate if there is a winningSide
  let winningSide;
  if (tieFormat?.winCriteria) {
    const { valueGoal, aggregateValue, tallyDirectives } =
      tieFormat.winCriteria;
    if (valueGoal) {
      const sideThatWon = sideScores
        .map((points, sideIndex) => ({ sideNumber: sideIndex + 1, points }))
        .find(({ points }) => points >= valueGoal);
      winningSide = sideThatWon?.sideNumber;
    } else if (aggregateValue) {
      const allTieMatchUpsCompleted = tieMatchUps.every(
        (matchUp) =>
          (matchUp.matchUpStatus &&
            completedMatchUpStatuses.includes(matchUp.matchUpStatus)) ||
          matchUp.winningSide
      );
      if (allTieMatchUpsCompleted && sideScores[0] !== sideScores[1]) {
        winningSide = sideScores[0] > sideScores[1] ? 1 : 2;
      }
    }

    if (!winningSide && tallyDirectives) {
      const matchUpId = matchUp.matchUpId;
      const inContextMatchUp = matchUp.hasContext
        ? matchUp
        : matchUpsMap?.drawMatchUps?.[matchUpId] ||
          (drawDefinition &&
            findMatchUp({
              inContext: true,
              drawDefinition,
              matchUpId,
            })?.matchUp);

      if (inContextMatchUp) {
        const { completedTieMatchUps, order } = tallyParticipantResults({
          matchUps: [inContextMatchUp],
        });
        if (completedTieMatchUps && order?.length) {
          const winningParticipantId = order[0].participantId;
          winningSide = inContextMatchUp.sides.find(
            ({ participantId }) => participantId === winningParticipantId
          )?.sideNumber;
        }
      }
    }
  }

  if (winningSide) set.winningSide = winningSide;

  return {
    scoreStringSide1,
    scoreStringSide2,
    winningSide,
    set,
  };
}
