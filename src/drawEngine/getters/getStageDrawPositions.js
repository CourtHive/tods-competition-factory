import { getQualifiersCount } from './getQualifiersCount';
import { getEntryProfile } from './getEntryProfile';

export function getStageDrawPositionsCount({ stage, drawDefinition }) {
  const { entryProfile } = getEntryProfile({ drawDefinition });
  return (entryProfile && entryProfile[stage]?.drawSize) || 0;
}

// drawSize - qualifyingPositions
export function getStageDrawPositionsAvailable({
  drawDefinition,
  stageSequence,
  stage,
}) {
  const drawSize = getStageDrawPositionsCount({ stage, drawDefinition });

  const { qualifiersCount } = getQualifiersCount({
    drawDefinition,
    stageSequence,
    stage,
  });
  return drawSize && drawSize - qualifiersCount;
}
