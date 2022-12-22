import { assignDrawPositionBye as assignBye } from '../../../../drawEngine/governors/positionGovernor/byePositioning/assignDrawPositionBye';

export function assignDrawPositionBye({
  tournamentRecord,
  drawDefinition,
  seedBlockInfo,
  drawPosition,
  structureId,
  event,
}) {
  return assignBye({
    tournamentRecord,
    drawDefinition,
    seedBlockInfo,
    drawPosition,
    structureId,
    event,
  });
}
