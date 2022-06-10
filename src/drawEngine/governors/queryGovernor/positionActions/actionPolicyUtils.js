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
  if (enabledStructures === false) return {};

  if (!enabledStructures?.length)
    return { policyActions: { enabledActions: [], disabledActions: [] } };

  const { stage, stageSequence, structureType } = structure || {};

  const policyActions = enabledStructures.find((structurePolicy) => {
    const { stages, stageSequences, structureTypes } = structurePolicy;
    const matchesStage =
      !stages?.length || (Array.isArray(stages) && stages.includes(stage));
    const matchesStageSequence =
      !stageSequences?.length ||
      (Array.isArray(stageSequences) && stageSequences.includes(stageSequence));
    const matchesStructureType =
      !structureTypes ||
      (Array.isArray(structureTypes) && structureTypes.includes(structureType));
    if (
      matchesStageSequence &&
      matchesStructureType &&
      structurePolicy &&
      matchesStage
    ) {
      return true;
    }
  });

  return { policyActions };
}

export function isAvailableAction({ action, policyActions }) {
  const disabled =
    !policyActions?.enabledActions ||
    (policyActions?.disabledActions?.length &&
      policyActions.disabledActions.includes(action));
  if (disabled) return false;

  const enabled =
    policyActions?.enabledActions.length === 0 ||
    policyActions?.enabledActions.includes(action);

  return enabled && !disabled ? true : false;
}
