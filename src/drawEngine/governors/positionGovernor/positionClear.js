import { structureActiveDrawPositions } from '../../getters/structureActiveDrawPositions';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { modifyDrawNotice } from '../../notifications/drawNotifications';
import { drawPositionRemovals } from './drawPositionRemovals';
import { findStructure } from '../../getters/findStructure';

import {
  DRAW_POSITION_ACTIVE,
  MISSING_DRAW_POSITION,
  DRAW_POSITION_NOT_CLEARED,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

/**
 *
 * @param {object} drawDefinition - automatically added if drawEngine state has been set
 * @param {number} drawPosition - number of drawPosition for which actions are to be returned
 * @param {string} structureId - id of structure of drawPosition
 * @param {string} participantId - id of participant to be removed
 *
 */
export function clearDrawPosition({
  inContextDrawMatchUps,
  tournamentRecord,
  drawDefinition,
  drawPosition,
  participantId,
  structureId,
  matchUpsMap,
}) {
  const { structure } = findStructure({ drawDefinition, structureId });
  const { positionAssignments } = structureAssignedDrawPositions({
    drawDefinition,
    structure,
  });

  const existingAssignment = positionAssignments.find(
    (assignment) =>
      (participantId && assignment.participantId === participantId) ||
      (drawPosition && assignment.drawPosition === drawPosition)
  );

  if (participantId && !drawPosition) {
    drawPosition = existingAssignment?.drawPosition;
  }
  if (!drawPosition) return { error: MISSING_DRAW_POSITION };
  if (!participantId) participantId = existingAssignment?.participantId;

  const { activeDrawPositions } = structureActiveDrawPositions({
    drawDefinition,
    structureId,
  });
  const drawPositionIsActive = activeDrawPositions.includes(drawPosition);

  // drawPosition may not be cleared if:
  // 1. drawPosition has been advanced by winning a matchUp
  // 2. drawPosition is paired with another drawPosition which has been advanced by winning a matchUp
  if (drawPositionIsActive) {
    return { error: DRAW_POSITION_ACTIVE };
  }

  if (!inContextDrawMatchUps) {
    ({ matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
      includeByeMatchUps: true,
      inContext: true,
      drawDefinition,
      matchUpsMap,
    }));
  }

  const { drawPositionCleared, error } = drawPositionRemovals({
    inContextDrawMatchUps,
    tournamentRecord,
    drawDefinition,
    structureId,
    drawPosition,
    matchUpsMap,
  });
  if (error) return { error };

  if (!drawPositionCleared) return { error: DRAW_POSITION_NOT_CLEARED };

  modifyDrawNotice({ drawDefinition, structureIds: [structureId] });

  return { ...SUCCESS, participantId };
}
