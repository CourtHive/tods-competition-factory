import { MISSING_DRAW_DEFINITION } from '../../../../constants/errorConditionConstants';

export function getValidSwapAction({
  drawDefinition,
  // structureId,
  // drawPosition,
  // positionAssignments,
  // activeDrawPositions,
  // inactiveDrawPositions,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  return {};
}
