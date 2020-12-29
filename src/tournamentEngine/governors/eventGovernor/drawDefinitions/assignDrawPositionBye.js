import { assignDrawPositionBye as assignBye } from '../../../../drawEngine/governors/positionGovernor/positionByes';

export function assignDrawPositionBye({
  drawDefinition,
  structureId,
  drawPosition,
}) {
  const result = assignBye({ drawDefinition, structureId, drawPosition });
  console.log({ result });
  return result;
}
