import {
  deleteMatchUpsNotice,
  modifyDrawNotice,
} from '../../../../drawEngine/notifications/drawNotifications';
import { getDrawStructures } from '../../../../drawEngine/getters/findStructure';
import { analyzeDraws } from '../../tournamentGovernor/analysis/analyzeDraws';
import { getMatchUpId } from '../../../../global/functions/extractors';

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

    const matchUps = mainStructure.matchUps || [];
    const relevantMatchUps = matchUps
      .sort((a, b) => a.roundPosition - b.roundPosition)
      .filter(
        ({ roundNumber }) => !structureData.inactiveRounds.includes(roundNumber)
      );
    const relevantMatchUpIds = relevantMatchUps.map(getMatchUpId);
    const deletedMatchUpIds = matchUps
      .map(getMatchUpId)
      .filter((matchUpId) => !relevantMatchUpIds.includes(matchUpId));

    // only ifMatchPlay can the positionAssignments be reallocated
    if (isMatchPlay) {
      const matchPlayMatchUps = relevantMatchUps
        .sort((a, b) => a.roundPosition - b.roundPosition)
        .filter(
          ({ roundNumber }) =>
            !structureData.inactiveRounds.includes(roundNumber)
        )
        .filter(({ winningSide }) => !isMatchPlay || winningSide);

      const matchPlayMatchUpIds = matchPlayMatchUps.map(getMatchUpId);
      const matchUpIdsToDelete = relevantMatchUpIds.filter(
        (matchUpId) => !matchPlayMatchUpIds.includes(matchUpId)
      );
      deletedMatchUpIds.push(...matchUpIdsToDelete);

      const existingDrawPositionPairings = matchPlayMatchUps.map(
        ({ drawPositions }) => drawPositions
      );
      const existingDrawPositions = existingDrawPositionPairings.flat();
      const drawPositionsMap = Object.assign(
        {},
        ...existingDrawPositions.map((drawPosition, i) => ({
          [drawPosition]: i + 1,
        }))
      );

      matchPlayMatchUps.forEach(
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
      mainStructure.matchUps = matchPlayMatchUps;
    }

    deleteMatchUpsNotice({ drawDefinition, matchUpIds: deletedMatchUpIds });
    modifyDrawNotice({ drawDefinition });
  }

  return { ...SUCCESS };
}
