import { updateAssignmentParticipantResults } from '../matchUpGovernor/updateAssignmentParticipantResults';
import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { addExtension } from '../../../global/functions/producers/addExtension';
import { modifyDrawNotice } from '../../notifications/drawNotifications';
import { findStructure } from '../../getters/findStructure';

import { CONTAINER } from '../../../constants/drawDefinitionConstants';
import { SUB_ORDER } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { TEAM } from '../../../constants/matchUpTypes';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_DRAW_POSITION,
  MISSING_STRUCTURE_ID,
} from '../../../constants/errorConditionConstants';

/**
 *
 * Used to order ROUND_ROBIN participants when finishingPosition ties cannot be broken algorithmically.
 * Assigns a subOrder value to a participant within a structure by drawPosition.
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
  drawPosition,
  structureId,
  subOrder,
  event,
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
  assignment && addExtension({ element: assignment, extension });

  const isDualMatchUp =
    event?.eventType === TEAM ||
    drawDefinition.matchUpType === TEAM ||
    event?.tieFormat ||
    drawDefinition?.tieFormat ||
    structure?.tieFormat;
  const matchUpFilters = isDualMatchUp && { matchUpTypes: [TEAM] };
  const { matchUps } = getAllStructureMatchUps({
    structure: targetStructure,
    afterRecoveryTimes: false,
    inContext: true,
    matchUpFilters,
    event,
  });
  const matchUpFormat =
    structure?.matchUpFormat || drawDefinition.matchUpFormat;

  updateAssignmentParticipantResults({
    positionAssignments,
    tournamentRecord,
    drawDefinition,
    matchUpFormat,
    matchUps,
    event,
  });

  modifyDrawNotice({ drawDefinition, structureIds: [structureId] });

  return { ...SUCCESS };
}
