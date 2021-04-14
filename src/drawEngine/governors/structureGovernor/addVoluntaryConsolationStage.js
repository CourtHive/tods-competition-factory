import { setStageDrawSize } from '../entryGovernor/stageEntryCounts';

import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { VOLUNTARY_CONSOLATION } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function addVoluntaryConsolationStage({ drawDefinition, drawSize }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  const result = setStageDrawSize({
    drawDefinition,
    stage: VOLUNTARY_CONSOLATION,
    drawSize,
  });
  if (result.error) return result;
  return SUCCESS;
}
