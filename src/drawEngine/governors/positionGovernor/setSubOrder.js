import { addExtension } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { updateAssignmentParticipantResults } from '../matchUpGovernor/updateAssignmentParticipantResults';
import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { findStructure } from '../../getters/findStructure';

import {
  MISSING_DRAW_DEFINITION,
  MISSING_DRAW_POSITION,
  MISSING_STRUCTURE_ID,
} from '../../../constants/errorConditionConstants';
import { CONTAINER } from '../../../constants/drawDefinitionConstants';
import { SUB_ORDER } from '../../../constants/extensionConstants';

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
export function setSubOrder({
  tournamentRecord,
  drawDefinition,
  event,

  structureId,
  drawPosition,
  subOrder,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };
  if (!drawPosition) return { error: MISSING_DRAW_POSITION };

  const { structure } = findStructure({ drawDefinition, structureId });
  let targetStructure = structure;

  if (structure.structureType === CONTAINER) {
    targetStructure = structure.structures.find((currentStructure) =>
      currentStructure.positionAssignments.find(
        (assignment) => assignment.drawPosition === drawPosition
      )
    );
  }

  const positionAssignments = targetStructure.positionAssignments;

  const assignment = positionAssignments.find(
    (assignment) => assignment.drawPosition === drawPosition
  );

  const extension = {
    name: SUB_ORDER,
    value: subOrder,
  };
  let result = addExtension({ element: assignment, extension });
  if (result.error) return result;

  const { matchUps } = getAllStructureMatchUps({
    structure: targetStructure,
    inContext: true,
  });
  const matchUpFormat =
    structure?.matchUpFormat || drawDefinition.matchUpFormat;

  result = updateAssignmentParticipantResults({
    tournamentRecord,
    drawDefinition,
    event,

    positionAssignments,
    matchUps,
    matchUpFormat,
  });

  return result;
}
