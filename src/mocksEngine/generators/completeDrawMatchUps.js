import { getAllStructureMatchUps } from '../../drawEngine/getters/getMatchUps/getAllStructureMatchUps';
import { generateOutcomeFromScoreString } from './generateOutcomeFromScoreString';
import { structureSort } from '../../drawEngine/getters/structureSort';
import { matchUpSort } from '../../drawEngine/getters/matchUpSort';

import { BYE, COMPLETED } from '../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../constants/resultConstants';

export function completeDrawMatchUps({
  tournamentEngine,
  matchUpFormat,
  drawId,
}) {
  const errors = [];
  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const sortedStructures = drawDefinition.structures
    .slice()
    .sort(structureSort);
  sortedStructures.forEach((structure) => {
    const { matchUps } = getAllStructureMatchUps({
      drawDefinition,
      structure,
      inContext: true,
    });
    matchUps.sort(matchUpSort).forEach(({ matchUpId }) => {
      const { matchUp: targetMatchUp } = tournamentEngine.findMatchUp({
        drawId,
        matchUpId,
      });
      if (targetMatchUp.readyToScore) {
        const result = completeMatchUp({
          tournamentEngine,
          targetMatchUp,
          scoreString: '6-1 6-1',
          winningSide: 1,
          matchUpStatus: COMPLETED,
          matchUpFormat,
          drawId,
        });
        if (result.error) {
          console.log({ result });
          errors.push(result.error);
          return result;
        }
      }
    });
  });
  return errors.length ? { error: errors } : SUCCESS;
}

export function completeMatchUp({
  tournamentEngine,
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
