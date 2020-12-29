import { assignDrawPositionBye as assignBye } from '../../../../drawEngine/governors/positionGovernor/positionByes';

export function assignDrawPositionBye({
  drawDefinition,
  structureId,
  drawPosition,
}) {
  return assignBye({ drawDefinition, structureId, drawPosition });
}
