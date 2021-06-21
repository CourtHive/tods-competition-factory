import { stageOrder } from '../../constants/drawDefinitionConstants';

export function structureSort(a, b) {
  return (
    (stageOrder[a?.stage] || 0) - (stageOrder[b?.stage] || 0) ||
    (b?.positionAssignments?.length || 9999) -
      (a?.positionAssignments?.length || 9999) ||
    (a?.stageSequence || 0) - (b?.stageSequence || 0)
  );
}
