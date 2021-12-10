import { getDrawStructures } from '../../../../drawEngine/getters/findStructure';
import { analyzeDraws } from '../../tournamentGovernor/analysis/analyzeDraws';

import { MISSING_DRAW_DEFINITION } from '../../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import { MAIN } from '../../../../constants/drawDefinitionConstants';

export function pruneDrawDefinition({
  tournamentRecord,
  drawDefinition,
  drawId,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const { drawsAnalysis } = analyzeDraws({ tournamentRecord });
  if (drawsAnalysis.canBePruned.includes(drawId)) {
    const isMatchPlay = drawsAnalysis.matchPlay.includes(drawId);
    const drawAnalysis = drawsAnalysis.drawAnalysis[drawId];
    const {
      structures: [mainStructure],
    } = getDrawStructures({
      drawDefinition,
      stage: MAIN,
      stageSequence: 1,
    });

    const structureData = drawAnalysis.structuresData.find(
      ({ structureId }) => mainStructure.structureId === structureId
    );

    // only ifMatchPlay can the positionAssignments be reallocated
    if (isMatchPlay) {
      const relevantMatchUps = (mainStructure.matchUps || [])
        .sort((a, b) => a.roundPosition - b.roundPosition)
        .filter(
          ({ roundNumber }) =>
            !structureData.inactiveRounds.includes(roundNumber)
        )
        .filter(({ winningSide }) => !isMatchPlay || winningSide);

      const existingDrawPositionPairings = relevantMatchUps.map(
        ({ drawPositions }) => drawPositions
      );
      const existingDrawPositions = existingDrawPositionPairings.flat();
      const drawPositionsMap = Object.assign(
        {},
        ...existingDrawPositions.map((drawPosition, i) => ({
          [drawPosition]: i + 1,
        }))
      );

      relevantMatchUps.forEach(
        (matchUp) =>
          (matchUp.drawPositions = matchUp.drawPositions.map(
            (drawPosition) => drawPositionsMap[drawPosition]
          ))
      );

      const updatedPositionAssignments = mainStructure.positionAssignments
        .filter((assignment) =>
          existingDrawPositions.includes(assignment.drawPosition)
        )
        .map((assignment) => {
          assignment.drawPosition = drawPositionsMap[assignment.drawPosition];
          return assignment;
        });

      mainStructure.positionAssignments = updatedPositionAssignments;
      mainStructure.matchUps = relevantMatchUps;
    }
  }

  return { ...SUCCESS };
}
