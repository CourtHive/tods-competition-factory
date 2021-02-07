import { getAllStructureMatchUps } from '../../drawEngine/getters/getMatchUps/getAllStructureMatchUps';
import { generateOutcomeFromScoreString } from './generateOutcomeFromScoreString';
import { structureSort } from '../../drawEngine/getters/structureSort';
import { matchUpSort } from '../../drawEngine/getters/matchUpSort';

import { BYE, COMPLETED } from '../../constants/matchUpStatusConstants';

export function completeDrawMatchUps({
  tournamentEngine,
  matchUpFormat,
  drawId,
}) {
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
        completeMatchUp({
          tournamentEngine,
          targetMatchUp,
          scoreString: '6-1 6-1',
          winningSide: 1,
          matchUpStatus: COMPLETED,
          matchUpFormat,
          drawId,
        });
      }
    });
  });
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
  if (!result.success) console.log(result, targetMatchUp);
}
