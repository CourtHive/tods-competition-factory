import { getAllStructureMatchUps } from '../../drawEngine/getters/getMatchUps/getAllStructureMatchUps';
import { generateOutcomeFromScoreString } from './generateOutcomeFromScoreString';
import { structureSort } from '../../drawEngine/getters/structureSort';
import { matchUpSort } from '../../drawEngine/getters/matchUpSort';
import { randomInt } from '../../utilities/math';

import tournamentEngineSync from '../../tournamentEngine/sync';

import { BYE, COMPLETED } from '../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../constants/resultConstants';

export function completeDrawMatchUps({
  tournamentEngine = tournamentEngineSync,
  randomWinningSide,
  matchUpFormat,
  drawId,
}) {
  const errors = [];
  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const sortedStructures = drawDefinition.structures
    .slice()
    .sort(structureSort);

  for (const structure of sortedStructures) {
    const { matchUps } = getAllStructureMatchUps({
      drawDefinition,
      structure,
      inContext: true,
    });

    const sortedMatchUpIds = matchUps
      .filter(({ winningSide }) => !winningSide)
      .sort(matchUpSort)
      .map(({ matchUpId }) => matchUpId);

    for (const matchUpId of sortedMatchUpIds) {
      const { matchUp: targetMatchUp } = tournamentEngine.findMatchUp({
        drawId,
        matchUpId,
      });
      const winningSide = randomWinningSide ? randomInt(1, 2) : 1;
      if (targetMatchUp?.readyToScore) {
        const result = completeMatchUp({
          tournamentEngine,
          targetMatchUp,
          matchUpStatus: COMPLETED,
          scoreString: '6-1 6-1',
          matchUpFormat,
          winningSide,
          drawId,
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
  tournamentEngine = tournamentEngineSync,
  targetMatchUp,
  scoreString,
  winningSide,
  matchUpStatus,
  matchUpFormat,
  outcomeDef,
  drawId,
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
  const result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId,
    outcome,
    matchUpFormat,
  });
  return result;
}
