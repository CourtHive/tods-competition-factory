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

  const drawPositionsToDelete = existingMatchUps
    .filter(({ matchUpId }) => matchUpIds.includes(matchUpId))
    .map(({ drawPositions }) => drawPositions)
    .flat();

  if (drawPositionsToDelete.length) {
    // remove positionAssignments with drawPositions to delete
    // build up a re-mapping of remaining drawPositions to close any gaps in sequential order
    // remap positionAssignments and remaining matchUp.drawPositions
  }

  deleteMatchUpsNotice({
    drawDefinition,
    matchUpIds,
    action: 'deleteAdHocMatchUps',
  });
  modifyDrawNotice({ drawDefinition });

  return { ...SUCCESS };
}
