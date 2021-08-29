import { getAllStructureMatchUps } from '../../drawEngine/getters/getMatchUps/getAllStructureMatchUps';
import { setMatchUpStatus } from '../../tournamentEngine/governors/eventGovernor/setMatchUpStatus';
import { getMatchUpsMap } from '../../drawEngine/getters/getMatchUps/getMatchUpsMap';
import { generateOutcomeFromScoreString } from './generateOutcomeFromScoreString';
import { structureSort } from '../../drawEngine/getters/structureSort';
import { matchUpSort } from '../../drawEngine/getters/matchUpSort';
import { generateOutcome } from './generateOutcome';

import { SUCCESS } from '../../constants/resultConstants';
import {
  BYE,
  COMPLETED,
  DOUBLE_WALKOVER,
} from '../../constants/matchUpStatusConstants';

export function completeDrawMatchUps({
  matchUpFormat,
  drawDefinition,
  randomWinningSide,
  completeAllMatchUps,
  matchUpStatusProfile,
}) {
  const sortedStructures = drawDefinition.structures
    .slice()
    .sort(structureSort);

  // to support legacy tests it is possible to use completeAllMatchUps
  // to pass a score string that will be applied to all matchUps
  const scoreString =
    typeof completeAllMatchUps === 'string' && completeAllMatchUps;
  const matchUpStatus = scoreString && COMPLETED;

  for (const structure of sortedStructures) {
    const matchUpsMap = getMatchUpsMap({ drawDefinition });
    const { matchUps } = getAllStructureMatchUps({
      drawDefinition,
      matchUpsMap,
      structure,
      inContext: true,
    });

    const sortedMatchUpIds = matchUps
      .filter(({ winningSide }) => !winningSide)
      .sort(matchUpSort)
      .map(({ matchUpId }) => matchUpId);

    for (const matchUpId of sortedMatchUpIds) {
      const { matchUps } = getAllStructureMatchUps({
        drawDefinition,
        matchUpsMap,
        structure,
        inContext: true,
      });

      const targetMatchUp = matchUps.find(
        (matchUp) => matchUp.matchUpId === matchUpId
      );
      const isWOWO = targetMatchUp.matchUpStatus === DOUBLE_WALKOVER;
      if (targetMatchUp?.readyToScore && !isWOWO) {
        const result = smartComplete({
          drawDefinition,
          targetMatchUp,
          matchUpFormat,
          winningSide: !randomWinningSide && 1,
          matchUpStatus,
          scoreString,
          matchUpStatusProfile,
        });
        if (result.error) return result;
      }
    }
  }
  return { ...SUCCESS };
}

export function completeMatchUp({
  targetMatchUp,
  scoreString,
  winningSide,
  matchUpStatus,
  matchUpFormat,
  drawDefinition,
}) {
  if (!targetMatchUp || targetMatchUp.matchUpStatus === BYE) {
    return;
  }
  const { matchUpId } = targetMatchUp || {};

  const { outcome } = generateOutcomeFromScoreString({
    scoreString,
    winningSide,
    matchUpStatus,
  });

  return setMatchUpStatus({
    drawDefinition,
    matchUpId,
    outcome,
    matchUpFormat,
  });
}

function smartComplete(params) {
  const {
    targetMatchUp,
    scoreString,
    winningSide,
    matchUpStatus,
    matchUpFormat,
    drawDefinition,
    matchUpStatusProfile = {},
  } = params;

  if (scoreString || matchUpStatus) return completeMatchUp(params);

  const { matchUpId } = targetMatchUp || {};
  const { outcome } = generateOutcome({
    matchUpFormat,
    winningSide,
    matchUpStatusProfile,
  });

  return setMatchUpStatus({
    drawDefinition,
    matchUpId,
    outcome,
    matchUpFormat,
  });
}
