import { getDrawStructures } from '../../../../drawEngine/getters/findStructure';
import { analyzeDraws } from '../../tournamentGovernor/analysis/analyzeDraws';
import { getMatchUpId } from '../../../../global/functions/extractors';
import {
  deleteMatchUpsNotice,
  modifyDrawNotice,
} from '../../../../drawEngine/notifications/drawNotifications';

import { MAIN } from '../../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';

export function pruneDrawDefinition({
  matchPlayDrawPositions = true, // when simply extracting matchUps for aggregation, drawPositions are unnecessary
  tournamentRecord,
  drawDefinition,
  drawId,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  let relevantMatchUps = [];

  const { drawsAnalysis } = analyzeDraws({ tournamentRecord });
  if (drawsAnalysis.canBePruned.includes(drawId)) {
    const isMatchPlay = drawsAnalysis.matchPlay.includes(drawId);
    const drawAnalysis = drawsAnalysis.drawAnalysis[drawId];
    const {
      structures: [mainStructure],
    } = getDrawStructures({
      stageSequence: 1,
      drawDefinition,
      stage: MAIN,
    });

    const structureData = drawAnalysis.structuresData.find(
      ({ structureId }) => mainStructure.structureId === structureId
    );

    const matchUps = mainStructure.matchUps || [];
    relevantMatchUps = matchUps
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
        .filter(({ winningSide }) => winningSide);

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

      matchPlayMatchUps.forEach((matchUp) => {
        if (matchPlayDrawPositions) {
          matchUp.drawPositions = matchUp.drawPositions.map(
            (drawPosition) => drawPositionsMap[drawPosition]
          );
        } else {
          delete matchUp.drawPositions;
        }
      });

      if (matchPlayDrawPositions) {
        const updatedPositionAssignments = mainStructure.positionAssignments
          .filter((assignment) =>
            existingDrawPositions.includes(assignment.drawPosition)
          )
          .map((assignment) => {
            assignment.drawPosition = drawPositionsMap[assignment.drawPosition];
            return assignment;
          });

        mainStructure.positionAssignments = updatedPositionAssignments;
      } else {
        mainStructure.positionAssignments = [];
      }
      mainStructure.matchUps = matchPlayMatchUps;
      relevantMatchUps = matchPlayMatchUps;
    }

    deleteMatchUpsNotice({
      tournamentId: tournamentRecord?.tournamentId,
      matchUpIds: deletedMatchUpIds,
      drawDefinition,
    });
    modifyDrawNotice({ drawDefinition });
  }

  return { ...SUCCESS, matchUps: relevantMatchUps };
}
