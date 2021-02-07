import { stageOrder } from '../../constants/drawDefinitionConstants';

export function structureSort(a, b) {
  return (
    (stageOrder[a.stage] || 0) - (stageOrder[b.stage] || 0) ||
    b.positionAssignments.length - a.positionAssignments.length ||
    a.stageSequence - b.stageSequence
  );
}
