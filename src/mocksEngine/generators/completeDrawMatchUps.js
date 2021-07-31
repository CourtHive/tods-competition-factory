import { getAllStructureMatchUps } from '../../drawEngine/getters/getMatchUps/getAllStructureMatchUps';
import { setMatchUpStatus } from '../../tournamentEngine/governors/eventGovernor/setMatchUpStatus';
import { getMatchUpsMap } from '../../drawEngine/getters/getMatchUps/getMatchUpsMap';
import { generateOutcomeFromScoreString } from './generateOutcomeFromScoreString';
import { structureSort } from '../../drawEngine/getters/structureSort';
import { matchUpSort } from '../../drawEngine/getters/matchUpSort';
import { randomInt } from '../../utilities/math';

import { SUCCESS } from '../../constants/resultConstants';
import {
  BYE,
  COMPLETED,
  DOUBLE_WALKOVER,
} from '../../constants/matchUpStatusConstants';

export function completeDrawMatchUps({
  randomWinningSide,
  matchUpFormat,
  drawDefinition,
}) {
  const errors = [];
  const sortedStructures = drawDefinition.structures
    .slice()
    .sort(structureSort);

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
      const winningSide = randomWinningSide ? randomInt(1, 2) : 1;
      const isWOWO = targetMatchUp.matchUpStatus === DOUBLE_WALKOVER;
      if (targetMatchUp?.readyToScore && !isWOWO) {
        const result = completeMatchUp({
          drawDefinition,
          targetMatchUp,
          matchUpStatus: COMPLETED,
          scoreString: '6-1 6-1', // TODO: function to generate winning score strings given score format
          matchUpFormat,
          winningSide,
        });
        if (result.error) {
          console.log({ result });
          errors.push(result.error);
          return result;
        }
      }
    }
  }
  return errors.length ? { error: errors } : SUCCESS;
}

export function completeMatchUp({
  targetMatchUp,
  scoreString,
  winningSide,
  matchUpStatus,
  matchUpFormat,
  outcomeDef,
  drawDefinition,
}) {
  const { outcome } = generateOutcomeFromScoreString({
    scoreString,
    winningSide,
    matchUpStatus,
  });
  if (!targetMatchUp) {
    console.log({ outcomeDef });
    return;
  }
  if (targetMatchUp.matchUpStatus === BYE) {
    console.log('targeted BYE matchUp', { outcomeDef });
    return;
  }
  const { matchUpId } = targetMatchUp || {};
  return setMatchUpStatus({
    drawDefinition,
    matchUpId,
    outcome,
    matchUpFormat,
  });
}
