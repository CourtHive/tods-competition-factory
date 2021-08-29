import {
  deleteMatchUpsNotice,
  modifyDrawNotice,
} from '../../notifications/drawNotifications';

import { ROUND_OUTCOME } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_STRUCTURE,
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

/**
 *
 * @param {string} drawId - allows tournamentEngine to find drawDefinition
 * @param {object} drawDefinition
 * @param {string} structureId
 * @param {string[]} matchUpIds - ids of matchUps to be deleted
 *
 */
export function deleteAdHocMatchUps({
  drawDefinition,
  structureId,
  matchUpIds = [],
}) {
  if (typeof drawDefinition !== 'object')
    return { error: MISSING_DRAW_DEFINITION };
  if (typeof structureId !== 'string') return { error: MISSING_STRUCTURE_ID };

  if (!Array.isArray(matchUpIds)) return { error: INVALID_VALUES };

  const structure = drawDefinition.structures?.find(
    (structure) => structure.structureId === structureId
  );
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  const existingMatchUps = structure?.matchUps;
  const structureHasRoundPositions = existingMatchUps.find(
    (matchUp) => !!matchUp.roundPosition
  );

  if (
    structure.structures ||
    structureHasRoundPositions ||
    structure.finishingPosition === ROUND_OUTCOME
  ) {
    return { error: INVALID_STRUCTURE };
  }

  const matchUpsToDelete = existingMatchUps.filter(({ matchUpId }) =>
    matchUpIds.includes(matchUpId)
  );
  const matchUpIdsToDelete = matchUpsToDelete.map(({ matchUpId }) => matchUpId);

  const drawPositionsToDelete = matchUpsToDelete
    .map(({ drawPositions }) => drawPositions)
    .flat();

  if (drawPositionsToDelete.length) {
    // remove positionAssignments with drawPositions to delete
    structure.positionAssignments = structure.positionAssignments
      .filter(
        ({ drawPosition }) => !drawPositionsToDelete.includes(drawPosition)
      )
      // sort just for sanity
      .sort((a, b) => a.drawPosition - b.drawPosition);

    structure.matchUps = structure.matchUps.filter(
      ({ matchUpId }) => !matchUpIdsToDelete.includes(matchUpId)
    );

    // build up a re-mapping of remaining drawPositions to close any gaps in sequential order
    const newDrawPositionsMap = Object.assign(
      {},
      ...structure.positionAssignments.map(({ drawPosition }, index) => ({
        [drawPosition]: index + 1,
      }))
    );

    // remap positionAssignments
    structure.positionAssignments = structure.positionAssignments.map(
      (assignment) => ({
        ...assignment,
        drawPosition: newDrawPositionsMap[assignment.drawPosition],
      })
    );

    // remap remaining matchUp.drawPositions
    const remapDrawPositions = (matchUp) =>
      (matchUp.drawPositions = matchUp.drawPositions.map(
        (drawPosition) => newDrawPositionsMap[drawPosition]
      ));
    structure.matchUps.forEach(remapDrawPositions);

    deleteMatchUpsNotice({
      drawDefinition,
      matchUpIds: matchUpIdsToDelete,
      action: 'deleteAdHocMatchUps',
    });
    modifyDrawNotice({ drawDefinition });
  }

  return { ...SUCCESS };
}
