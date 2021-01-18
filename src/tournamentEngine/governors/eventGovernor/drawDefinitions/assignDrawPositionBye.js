import { assignDrawPositionBye as assignBye } from '../../../../drawEngine/governors/positionGovernor/byePositioning/assignDrawPositionBye';

export function assignDrawPositionBye({
  drawDefinition,
  structureId,
  drawPosition,
}) {
  return assignBye({ drawDefinition, structureId, drawPosition });
}
