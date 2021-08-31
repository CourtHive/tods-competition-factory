import { getPolicyDefinitions } from '../../../../tournamentEngine/governors/queryGovernor/getPolicyDefinitions';

import { POLICY_TYPE_POSITION_ACTIONS } from '../../../../constants/policyConstants';
import { POLICY_POSITION_ACTIONS_DEFAULT } from '../../../../fixtures/policies/POLICY_POSITION_ACTIONS_DEFAULT';

export function getEnabledStructures({
  policyDefinitions,
  tournamentRecord,
  drawDefinition,
  structure,
  event,
}) {
  const { policyDefinitions: attachedPolicy } = getPolicyDefinitions({
    policyTypes: [POLICY_TYPE_POSITION_ACTIONS],
    tournamentRecord,
    drawDefinition,
    event,
  });

  policyDefinitions =
    policyDefinitions || attachedPolicy || POLICY_POSITION_ACTIONS_DEFAULT;

  const positionActionsPolicy = policyDefinitions[POLICY_TYPE_POSITION_ACTIONS];

  const { enabledStructures, disabledStructures } = positionActionsPolicy || {};
  const actionsDisabled = disabledStructures?.find(
    (structurePolicy) =>
      structurePolicy.stages?.includes(structure.stage) &&
      (!structurePolicy.stageSequences?.length ||
        structurePolicy.stageSequences.includes(structure.stageSequence))
  );

  return { enabledStructures, actionsDisabled };
}

export function getPolicyActions({ enabledStructures, structure }) {
  if (!enabledStructures) return {};

  if (!enabledStructures.length)
    return { policyActions: { enabledActions: [], disabledActions: [] } };

  const policyActions = enabledStructures.find((structurePolicy) => {
    const matchesStage =
      !structurePolicy.stages?.length ||
      structurePolicy.stages.includes(structure.stage);
    const matchesStageSequence =
      !structurePolicy.stageSequences?.length ||
      structurePolicy.stageSequences.includes(structure.stageSequence);
    if (structurePolicy && matchesStage && matchesStageSequence) {
      return true;
    }
  });

  return { policyActions };
}

export function isAvailableAction({ action, policyActions }) {
  if (
    !policyActions?.enabledActions ||
    (policyActions?.disabledActions?.length &&
      policyActions.disabledActions.includes(action))
  ) {
    return false;
  }
  if (
    policyActions?.enabledActions.length === 0 ||
    policyActions?.enabledActions.includes(action)
  ) {
    return true;
  }
  return false;
}
