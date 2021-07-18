import { conditionallyDisableLinkPositioning } from './conditionallyDisableLinkPositioning';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { addPositionActionTelemetry } from './addPositionActionTelemetry';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { findStructure } from '../../getters/findStructure';
import { assignDrawPosition } from './positionAssignment';
import { clearDrawPosition } from './positionClear';

import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function positionParticipantAction(params) {
  const {
    participantId,
    drawDefinition,
    drawPosition,
    structureId,
    positionActionName,
    participantIdAttributeName = 'participantId',
  } = params;

  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  let { inContextDrawMatchUps, matchUpsMap } = params;

  if (!matchUpsMap) {
    matchUpsMap = getMatchUpsMap({ drawDefinition });
    Object.assign(params, { matchUpsMap });
  }

  if (!inContextDrawMatchUps) {
    ({ matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
      drawDefinition,
      inContext: true,
      includeByeMatchUps: true,

      matchUpsMap,
    }));
    Object.assign(params, { inContextDrawMatchUps });
  }

  const { positionAssignments } = getPositionAssignments({
    drawDefinition,
    structureId,
  });
  const positionAssignment = positionAssignments.find(
    (assignment) => assignment.drawPosition === drawPosition
  );

  if (positionAssignment?.participantId) {
    let result = assignDrawPosition({
      drawDefinition,
      structureId,
      drawPosition,
      participantId,

      matchUpsMap,
      inContextDrawMatchUps,
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

    matchUpsMap,
    inContextDrawMatchUps,
  });
  if (result.error) return result;
  const removedParticipantId = result.participantId;

  result = assignDrawPosition({
    drawDefinition,
    structureId,
    drawPosition,
    participantId,

    matchUpsMap,
    inContextDrawMatchUps,
  });
  if (!result.success) return result;

  return successNotice({ removedParticipantId });

  function successNotice({ removedParticipantId }) {
    const { structure } = findStructure({ drawDefinition, structureId });
    conditionallyDisableLinkPositioning({
      structure,
      drawPositions: [drawPosition],
    });
    const positionAction = {
      name: positionActionName,
      drawPosition,
      structureId,
      [participantIdAttributeName]: participantId,
    };

    addPositionActionTelemetry({ drawDefinition, positionAction });

    return { ...SUCCESS, removedParticipantId };
  }
}
