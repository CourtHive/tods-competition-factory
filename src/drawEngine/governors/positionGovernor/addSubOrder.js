import { addExtension } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { getPositionAssignments } from '../../getters/positionsGetter';

import {
  MISSING_DRAW_DEFINITION,
  MISSING_DRAW_POSITION,
  MISSING_STRUCTURE_ID,
} from '../../../constants/errorConditionConstants';

/**
 *
 * Assigns a subOrder value to a participant within a structure by drawPosition where participant has been assigned
 *
 * @param {object} drawDefinition - added automatically by drawEngine if state is present or by tournamentEngine with drawId
 * @param {string} drawId - used by tournamentEngine to retrieve drawDefinition
 * @param {string} structureId - structure identifier within drawDefinition
 * @param {number} drawPosition - drawPosition of the participant where subOrder is to be added
 * @param {number} subOrder - order in which tied participant should receive finishing position
 *
 */
export function addSubOrder({
  drawDefinition,
  structureId,
  drawPosition,
  subOrder,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };
  if (!drawPosition) return { error: MISSING_DRAW_POSITION };

  const { positionAssignments } = getPositionAssignments({
    drawDefinition,
    structureId,
  });

  const assignment = positionAssignments.find(
    (assignment) => assignment.drawPosition === drawPosition
  );

  const extension = {
    name: 'subOrder',
    value: subOrder,
  };
  return addExtension({ element: assignment, extension });
}
