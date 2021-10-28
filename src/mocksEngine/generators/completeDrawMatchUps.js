import { getAllStructureMatchUps } from '../../drawEngine/getters/getMatchUps/getAllStructureMatchUps';
import { setMatchUpStatus } from '../../tournamentEngine/governors/eventGovernor/setMatchUpStatus';
import { getMatchUpsMap } from '../../drawEngine/getters/getMatchUps/getMatchUpsMap';
import { generateOutcomeFromScoreString } from './generateOutcomeFromScoreString';
import { structureSort } from '../../drawEngine/getters/structureSort';
import { matchUpSort } from '../../drawEngine/getters/matchUpSort';
import { getMatchUpId } from '../../global/functions/extractors';
import { generateOutcome } from './generateOutcome';

import { SUCCESS } from '../../constants/resultConstants';
import {
  BYE,
  COMPLETED,
  DOUBLE_WALKOVER,
} from '../../constants/matchUpStatusConstants';

export function completeDrawMatchUps({
  matchUpStatusProfile,
  completeAllMatchUps,
  randomWinningSide,
  drawDefinition,
  matchUpFormat,
  event,
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
      inContext: true,
      drawDefinition,
      matchUpsMap,
      structure,
      event,
    });

    const sortedMatchUpIds = matchUps
      .filter(({ winningSide }) => !winningSide)
      .sort(matchUpSort)
      .map(getMatchUpId);

    for (const matchUpId of sortedMatchUpIds) {
      const { matchUps } = getAllStructureMatchUps({
        inContext: true,
        drawDefinition,
        matchUpsMap,
        structure,
        event,
      });

      const targetMatchUp = matchUps.find(
        (matchUp) => matchUp.matchUpId === matchUpId
      );
      const isWOWO = targetMatchUp.matchUpStatus === DOUBLE_WALKOVER;
      if (targetMatchUp?.readyToScore && !isWOWO) {
        const result = smartComplete({
          winningSide: !randomWinningSide && 1,
          matchUpStatusProfile,
          drawDefinition,
          targetMatchUp,
          matchUpFormat,
          matchUpStatus,
          scoreString,
        });
        if (result.error) return result;
      }
    }
  }
  return { ...SUCCESS };
}

export function completeDrawMatchUp({
  drawDefinition,
  targetMatchUp,
  matchUpStatus,
  matchUpFormat,
  scoreString,
  winningSide,
}) {
  if (!targetMatchUp || targetMatchUp.matchUpStatus === BYE) {
    return;
  }
  const { matchUpId } = targetMatchUp || {};

  const { outcome } = generateOutcomeFromScoreString({
    matchUpStatus,
    scoreString,
    winningSide,
  });

  return setMatchUpStatus({
    drawDefinition,
    matchUpFormat,
    matchUpId,
    outcome,
  });
}

// NOTE: matchUpFormat must come from collectionDefinition in TEAM events
function smartComplete(params) {
  const {
    matchUpStatusProfile = {},
    drawDefinition,
    matchUpStatus,
    matchUpFormat,
    targetMatchUp,
    scoreString,
    winningSide,
  } = params;

  if (scoreString || matchUpStatus) return completeDrawMatchUp(params);

  const { matchUpId } = targetMatchUp || {};
  const { outcome } = generateOutcome({
    matchUpStatusProfile,
    matchUpFormat,
    winningSide,
  });

  return setMatchUpStatus({
    matchUpFormat,
    drawDefinition,
    matchUpId,
    outcome,
  });
}
