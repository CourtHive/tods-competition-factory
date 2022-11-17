import { findExtension } from '../../tournamentEngine/governors/queryGovernor/extensionQueries';

import { completedMatchUpStatuses } from '../../constants/matchUpStatusConstants';
import { ROUND_TARGET } from '../../constants/extensionConstants';
import {
  aggregateOrder,
  finishOrder,
  stageOrder,
  AGGREGATE_EVENT_STRUCTURES,
  FINISHING_POSITIONS,
  MAIN,
} from '../../constants/drawDefinitionConstants';

export function structureSort(a, b, config = {}) {
  const getRoundTarget = (element) =>
    findExtension({ element, name: ROUND_TARGET })?.extension?.value;

  const completed = config?.deprioritizeCompleted;
  const aggregate =
    config?.mode === AGGREGATE_EVENT_STRUCTURES && aggregateOrder;
  const finish = config?.mode === FINISHING_POSITIONS && finishOrder;

  const orderProtocol = finish || aggregate || stageOrder;

  const isMain1 = (s) => s?.stage === MAIN && s?.stageSequence === 1;
  const protocolSequence = (s) => (isMain1(s) ? -1 : orderProtocol[s?.stage]);

  const completedStructure = (s) =>
    s?.matchUps.every(({ matchUpStatus }) =>
      completedMatchUpStatuses.includes(matchUpStatus) ? 1 : -1
    );

  const comparison =
    (completed && completedStructure(a) - completedStructure(b)) ||
    (aggregate && protocolSequence(a) - protocolSequence(b)) ||
    (orderProtocol[a?.stage] || 0) - (orderProtocol[b?.stage] || 0) ||
    (getRoundTarget(a) || 0) - (getRoundTarget(b) || 0) ||
    (!finish &&
      !aggregate &&
      (b?.positionAssignments?.length || Infinity) -
        (a?.positionAssignments?.length || Infinity)) ||
    (a?.stageSequence || 0) - (b?.stageSequence || 0) ||
    (getMinFinishingPositionRange(a) || 0) -
      (getMinFinishingPositionRange(b) || 0);

  return comparison;
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
