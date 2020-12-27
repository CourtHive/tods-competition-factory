import { positionActions as drawEnginePositionActions } from '../../../drawEngine/governors/queryGovernor/positionActions';

export function positionActions({
  drawId,
  drawDefinition,
  drawPosition,
  structureId,
}) {
  return drawEnginePositionActions({
    drawId,
    drawDefinition,
    drawPosition,
    structureId,
  });
}
