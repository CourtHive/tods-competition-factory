import { getQualifiersCount } from './getQualifiersCount';
import { getEntryProfile } from './getEntryProfile';

export function getStageDrawPositionsCount({ stage, drawDefinition }) {
  const { entryProfile } = getEntryProfile({ drawDefinition });
  return entryProfile?.[stage]?.drawSize || 0;
}

// drawSize - qualifyingPositions
export function getStageDrawPositionsAvailable(params) {
  const { provisionalPositioning, drawDefinition, stageSequence, stage } =
    params;
  const drawSize = getStageDrawPositionsCount({ stage, drawDefinition });

  const { qualifiersCount } = getQualifiersCount({
    provisionalPositioning,
    drawDefinition,
    stageSequence,
    stage,
  });
  return drawSize && drawSize - qualifiersCount;
}
