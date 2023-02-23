import { POLICY_TYPE_POSITION_ACTIONS } from '../../../../constants/policyConstants';
import { POLICY_POSITION_ACTIONS_DEFAULT } from '../../../../fixtures/policies/POLICY_POSITION_ACTIONS_DEFAULT';

export function getEnabledStructures({
  appliedPolicies,
  drawDefinition,
  structure,
}) {
  const positionActionsPolicy =
    appliedPolicies?.[POLICY_TYPE_POSITION_ACTIONS] ||
    POLICY_POSITION_ACTIONS_DEFAULT[POLICY_TYPE_POSITION_ACTIONS];

  const relevantLinks = drawDefinition.links?.filter(
    (link) => link?.target?.structureId === structure?.structureId
  );
  const targetFeedProfiles =
    relevantLinks?.map(({ target }) => target.feedProfile) || [];

  const { enabledStructures, disabledStructures } = positionActionsPolicy || {};
  const actionsDisabled = disabledStructures?.find((structurePolicy) => {
    const { stages, stageSequences, structureTypes, feedProfiles } =
      structurePolicy;
    return (
      (!feedProfiles?.length ||
        (Array.isArray(feedProfiles) &&
          feedProfiles.some((feedProfile) =>
            targetFeedProfiles.includes(feedProfile)
          ))) &&
      (!stages?.length ||
        (Array.isArray(stages) && stages?.includes(structure.stage))) &&
      (!structureTypes?.length ||
        (Array.isArray(structureTypes) &&
          structureTypes?.includes(structure.structureType))) &&
      (!stageSequences?.length ||
        (Array.isArray(stageSequences) &&
          stageSequences.includes(structure.stageSequence)))
    );
  });

  return { enabledStructures, actionsDisabled, positionActionsPolicy };
}

export function activePositionsCheck({
  activePositionOverrides,
  activeDrawPositions,
  action,
}) {
  if (action && activePositionOverrides.includes(action)) return true;
  return !activeDrawPositions.length;
}

export function getPolicyActions({
  enabledStructures,
  drawDefinition,
  structure,
}) {
  if (enabledStructures === false) return {};

  if (!enabledStructures?.length)
    return { policyActions: { enabledActions: [], disabledActions: [] } };

  const { stage, stageSequence, structureType } = structure || {};

  const relevantLinks = drawDefinition.links?.filter(
    (link) => link?.target?.structureId === structure?.structureId
  );
  const targetFeedProfiles =
    relevantLinks?.map(({ target }) => target.feedProfile) || [];

  const policyActions = enabledStructures.find((structurePolicy) => {
    const { stages, stageSequences, structureTypes, feedProfiles } =
      structurePolicy || {};

    const matchesStage =
      !stages?.length || (Array.isArray(stages) && stages.includes(stage));
    const matchesStageSequence =
      !stageSequences?.length ||
      (Array.isArray(stageSequences) && stageSequences.includes(stageSequence));
    const matchesStructureType =
      !structureTypes?.length ||
      (Array.isArray(structureTypes) && structureTypes.includes(structureType));
    const matchesFeedProfile =
      !feedProfiles?.length ||
      (Array.isArray(feedProfiles) &&
        feedProfiles.some((feedProfile) =>
          targetFeedProfiles.includes(feedProfile)
        ));
    if (
      matchesStageSequence &&
      matchesStructureType &&
      matchesFeedProfile &&
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
