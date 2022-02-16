import { modifyDrawName } from '../../../tournamentEngine/governors/eventGovernor/drawDefinitions/modifyDrawName';
import { setStageDrawSize } from '../entryGovernor/stageEntryCounts';

import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { VOLUNTARY_CONSOLATION } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function addVoluntaryConsolationStage({ drawDefinition, drawSize }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  const result = setStageDrawSize({
    stage: VOLUNTARY_CONSOLATION,
    stageSequence: 1,
    drawDefinition,
    drawSize,
  });
  if (result.error) return result;

  modifyDrawName({ drawDefinition });

  return SUCCESS;
}
