import { getStageDrawPositionsCount } from './getStageDrawPositions';
import { stageExists } from './stageGetter';

import { VOLUNTARY_CONSOLATION } from '@Constants/drawDefinitionConstants';

export function getValidStage({ stage, drawDefinition }) {
  return Boolean(
    stage === VOLUNTARY_CONSOLATION ||
      (stageExists({ stage, drawDefinition }) && getStageDrawPositionsCount({ stage, drawDefinition })),
  );
}
