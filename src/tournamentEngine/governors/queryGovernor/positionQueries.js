import { positionActions as drawEnginePositionActions } from '../../../drawEngine/governors/queryGovernor/positionActions/positionActions';

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
