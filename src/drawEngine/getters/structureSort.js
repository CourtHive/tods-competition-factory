import { findExtension } from '../../tournamentEngine/governors/queryGovernor/extensionQueries';
import {
  finishOrder,
  stageOrder,
  FINISHING_POSITIONS,
} from '../../constants/drawDefinitionConstants';

import { ROUND_TARGET } from '../../constants/extensionConstants';

// TODO: option to sort COMPLETED structures to the bottom
export function structureSort(a, b, config = {}) {
  const getRoundTarget = (element) =>
    findExtension({ element, name: ROUND_TARGET })?.extension?.value;

  if (config?.mode === FINISHING_POSITIONS) {
    return (
      (finishOrder[a?.stage] || 0) - (finishOrder[b?.stage] || 0) ||
      (getMinFinishingPositionRange(a) || 0) -
        (getMinFinishingPositionRange(b) || 0)
    );
  }

  return (
    (stageOrder[a?.stage] || 0) - (stageOrder[b?.stage] || 0) ||
    (getRoundTarget(a) || 0) - (getRoundTarget(b) || 0) ||
    (b?.positionAssignments?.length || 9999) -
      (a?.positionAssignments?.length || 9999) ||
    (a?.stageSequence || 0) - (b?.stageSequence || 0) ||
    (getMinFinishingPositionRange(a) || 0) -
      (getMinFinishingPositionRange(b) || 0)
  );
}

export function getMinFinishingPositionRange(structure) {
  return (structure?.matchUps || []).reduce((rangeSum, matchUp) => {
    const sum = (matchUp.finishingPositionRange?.winner || []).reduce(
      (a, b) => a + b,
      0
    );
    return !rangeSum || sum < rangeSum ? sum : rangeSum;
  }, undefined);
}
