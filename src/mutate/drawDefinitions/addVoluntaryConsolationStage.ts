import { modifyDrawNotice } from '../notifications/drawNotifications';
import { setStageDrawSize } from './entryGovernor/stageEntryCounts';

import { MISSING_DRAW_DEFINITION } from '@Constants/errorConditionConstants';
import { VOLUNTARY_CONSOLATION } from '@Constants/drawDefinitionConstants';
import { SUCCESS } from '@Constants/resultConstants';

export function addVoluntaryConsolationStage({ drawDefinition, drawSize }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  const result = setStageDrawSize({
    stage: VOLUNTARY_CONSOLATION,
    stageSequence: 1,
    drawDefinition,
    drawSize,
  });
  if (result.error) return result;

  modifyDrawNotice({ drawDefinition });

  return { ...SUCCESS };
}
