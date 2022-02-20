import { getStageDrawPositionsCount } from './getStageDrawPositions';
import { stageExists } from './stageGetter';

export function getValidStage({ stage, drawDefinition }) {
  return Boolean(
    stageExists({ stage, drawDefinition }) &&
      getStageDrawPositionsCount({ stage, drawDefinition })
  );
}
