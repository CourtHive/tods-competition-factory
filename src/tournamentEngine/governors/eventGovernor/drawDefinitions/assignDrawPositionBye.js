import { assignDrawPositionBye as assignBye } from '../../../../drawEngine/governors/positionGovernor/byePositioning/assignDrawPositionBye';

export function assignDrawPositionBye({
  tournamentRecord,
  drawDefinition,
  drawPosition,
  structureId,
}) {
  return assignBye({
    tournamentRecord,
    drawDefinition,
    drawPosition,
    structureId,
  });
}
