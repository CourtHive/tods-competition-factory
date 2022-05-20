import { conditionallyDisableLinkPositioning } from './conditionallyDisableLinkPositioning';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { decorateResult } from '../../../global/functions/decorateResult';
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
    participantIdAttributeName = 'participantId',
    isQualifierPosition,
    positionActionName,
    tournamentRecord,
    drawDefinition,
    participantId,
    drawPosition,
    structureId,
    event,
  } = params;

  const stack = 'positionParticipantAction';

  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  let { inContextDrawMatchUps, matchUpsMap } = params;

  if (!matchUpsMap) {
    matchUpsMap = getMatchUpsMap({ drawDefinition });
    Object.assign(params, { matchUpsMap });
  }

  if (!inContextDrawMatchUps) {
    ({ matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
      includeByeMatchUps: true,
      inContext: true,
      drawDefinition,
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
    const removedParticipantId = positionAssignment.participantId;
    let result = assignDrawPosition({
      inContextDrawMatchUps,
      tournamentRecord,
      drawDefinition,
      participantId,
      drawPosition,
      structureId,
      matchUpsMap,
    });
    if (!result.success) {
      return decorateResult({ result, stack });
    }
    return successNotice({
      removedParticipantId,
    });
  }

  let result = clearDrawPosition({
    inContextDrawMatchUps,
    tournamentRecord,
    drawDefinition,
    drawPosition,
    structureId,
    matchUpsMap,
    event,
  });
  if (result.error) return decorateResult({ result, stack });
  const removedParticipantId = result.participantId;

  result = assignDrawPosition({
    inContextDrawMatchUps,
    isQualifierPosition,
    tournamentRecord,
    drawDefinition,
    participantId,
    drawPosition,
    structureId,
    matchUpsMap,
    event,
  });
  if (!result.success) return decorateResult({ result, stack });

  return successNotice({ removedParticipantId });

  function successNotice({ removedParticipantId }) {
    const { structure } = findStructure({ drawDefinition, structureId });
    conditionallyDisableLinkPositioning({
      drawPositions: [drawPosition],
      structure,
    });
    const positionAction = {
      [participantIdAttributeName]: participantId,
      name: positionActionName,
      drawPosition,
      structureId,
    };

    addPositionActionTelemetry({ drawDefinition, positionAction });

    return decorateResult({
      result: { ...SUCCESS, context: { removedParticipantId }, stack },
    });
  }
}
