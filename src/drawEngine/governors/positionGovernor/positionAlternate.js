import { addExtension } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { findExtension } from '../../../tournamentEngine/governors/queryGovernor/extensionQueries';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { assignDrawPosition } from './positionAssignment';
import { clearDrawPosition } from './positionClear';

import { SUCCESS } from '../../../constants/resultConstants';

export function alternateDrawPositionAssignment({
  alternateParticipantId,
  drawDefinition,
  drawPosition,
  structureId,
}) {
  const { positionAssignments } = getPositionAssignments({
    drawDefinition,
    structureId,
  });
  const positionAssignment = positionAssignments.find(
    (assignment) => assignment.drawPosition === drawPosition
  );

  if (positionAssignment.participantId) {
    let result = assignDrawPosition({
      drawDefinition,
      structureId,
      drawPosition,
      participantId: alternateParticipantId,
    });
    if (!result.success) {
      console.log({ result });
    }
    return successNotice({
      removedParticipantId: positionAssignment.participantId,
    });
  }
  let result = clearDrawPosition({
    drawDefinition,
    drawPosition,
    structureId,
  });
  if (result.error) return result;
  const removedParticipantId = result.participantId;

  result = assignDrawPosition({
    drawDefinition,
    structureId,
    drawPosition,
    participantId: alternateParticipantId,
  });
  if (!result.success) return result;

  return successNotice({ removedParticipantId });

  function successNotice({ removedParticipantId }) {
    // START: ############## telemetry ##############
    const { extension } = findExtension({
      element: drawDefinition,
      name: 'positionActions',
    });
    const action = {
      name: 'alternateDrawPositionAssignment',
      drawPosition,
      structureId,
      alternateParticipantId,
    };
    const updatedExtension = {
      name: 'positionActions',
      value: Array.isArray(extension?.value)
        ? extension.value.concat(action)
        : [action],
    };
    addExtension({ element: drawDefinition, extension: updatedExtension });
    // END: ############## telemetry ##############

    return Object.assign({}, SUCCESS, { removedParticipantId });
  }
}
