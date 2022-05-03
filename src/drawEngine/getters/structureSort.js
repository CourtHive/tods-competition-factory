import { findExtension } from '../../tournamentEngine/governors/queryGovernor/extensionQueries';
import { stageOrder } from '../../constants/drawDefinitionConstants';

import { ROUND_TARGET } from '../../constants/extensionConstants';

export function structureSort(a, b) {
  const getRoundTarget = (element) =>
    findExtension({ element, name: ROUND_TARGET })?.extension?.value;
  return (
    (stageOrder[a?.stage] || 0) - (stageOrder[b?.stage] || 0) ||
    (getRoundTarget(a) || 0) - (getRoundTarget(b) || 0) ||
    (b?.positionAssignments?.length || 9999) -
      (a?.positionAssignments?.length || 9999) ||
    (a?.stageSequence || 0) - (b?.stageSequence || 0)
  );
}
