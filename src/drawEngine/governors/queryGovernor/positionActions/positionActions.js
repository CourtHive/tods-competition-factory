import { getPolicyDefinition } from '../../../../tournamentEngine/governors/queryGovernor/getPolicyDefinition';
import { structureActiveDrawPositions } from '../../../getters/structureActiveDrawPositions';
import { getStructureSeedAssignments } from '../../../getters/getStructureSeedAssignments';
import { structureAssignedDrawPositions } from '../../../getters/positionsGetter';
import { getValidAssignmentActions } from './participantAssignments';
import { getValidAlternatesAction } from './participantAlternates';
import { isValidSeedPosition } from '../../../getters/seedGetter';
import { stageEntries } from '../../../getters/stageGetter';
import { getValidSwapAction } from './getValidSwapAction';

import {
  WILDCARD,
  DIRECT_ACCEPTANCE,
} from '../../../../constants/entryStatusConstants';
import {
  INVALID_DRAW_POSITION,
  MISSING_DRAW_DEFINITION,
  MISSING_DRAW_POSITION,
  MISSING_STRUCTURE_ID,
  STRUCTURE_NOT_FOUND,
} from '../../../../constants/errorConditionConstants';
import {
  REMOVE_ASSIGNMENT,
  REMOVE_ASSIGNMENT_METHOD,
  ADD_NICKNAME,
  ADD_PENALTY,
  ASSIGN_BYE,
  SEED_VALUE,
  SEED_VALUE_METHOD,
  ADD_PENALTY_METHOD,
  ADD_NICKNAME_METHOD,
  WITHDRAW_PARTICIPANT,
  WITHDRAW_PARTICIPANT_METHOD,
  SWAP_PARTICIPANTS,
  ALTERNATE_PARTICIPANT,
  ASSIGN_PARTICIPANT,
} from '../../../../constants/positionActionConstants';
import { POLICY_TYPE_POSITION_ACTIONS } from '../../../../constants/policyConstants';
import { POLICY_POSITION_ACTIONS_DEFAULT } from '../../../../fixtures/policies/POLICY_POSITION_ACTIONS_DEFAULT';

/**
 *
 * return an array of all possible validActions for a given drawPosition within a structure
 *
 * @param {object} drawDefinition - passed in automatically by drawEngine if state has been set
 * @param {number} drawPosition - number of drawPosition for which actions are to be returned
 * @param {string} structureId - id of structure of drawPosition
 *
 */
export function positionActions({
  tournamentParticipants = [],
  policyDefinition,
  tournamentRecord,
  drawDefinition,
  drawPosition,
  structureId,
  event,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (drawPosition === undefined) return { error: MISSING_DRAW_POSITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };

  const {
    activeDrawPositions,
    byeDrawPositions,
    inactiveDrawPositions,
    structure,
  } = structureActiveDrawPositions({ drawDefinition, structureId });

  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  const { enabledStructures, actionsDisabled } = getEnabledStructures({
    policyDefinition,
    tournamentRecord,
    drawDefinition,
    structure,
    event,
  });

  if (actionsDisabled) return { message: 'Actions Disabled for structure' };

  const { policyActions } = getPolicyActions({ enabledStructures, structure });

  const validActions = [];
  const { drawId } = drawDefinition;

  const {
    assignedPositions,
    positionAssignments,
  } = structureAssignedDrawPositions({ structure });
  const positionAssignment = assignedPositions.find(
    (assignment) => assignment.drawPosition === drawPosition
  );

  const drawPositions = positionAssignments.map(
    (assignment) => assignment.drawPosition
  );

  if (!drawPositions?.includes(drawPosition))
    return { error: INVALID_DRAW_POSITION };

  const { stage, stageSequence } = structure;
  const entryTypes = [DIRECT_ACCEPTANCE, WILDCARD];
  const entries = stageEntries({
    drawDefinition,
    stageSequence,
    structureId,
    entryTypes,
    stage,
  });

  const assignedParticipantIds = assignedPositions.map(
    (assignment) => assignment.participantId
  );
  const unassignedParticipantIds = entries
    .filter((entry) => !assignedParticipantIds.includes(entry.participantId))
    .map((entry) => entry.participantId);

  const isByePosition = byeDrawPositions.includes(drawPosition);
  const isActiveDrawPosition = activeDrawPositions.includes(drawPosition);

  if (
    isAvailableAction({ policyActions, action: ASSIGN_PARTICIPANT }) &&
    (!positionAssignment || isByePosition)
  ) {
    const { validAssignmentActions } = getValidAssignmentActions({
      drawDefinition,
      structureId,
      drawPosition,
      isByePosition,
      positionAssignments,
      tournamentParticipants,
      unassignedParticipantIds,
    });
    validAssignmentActions?.forEach((action) => validActions.push(action));
  }

  const { participantId } = positionAssignment || {};
  const participant =
    participantId &&
    tournamentParticipants.find(
      (participant) => participant.participantId === participantId
    );

  if (positionAssignment) {
    if (
      isAvailableAction({ policyActions, action: REMOVE_ASSIGNMENT }) &&
      !activeDrawPositions.includes(drawPosition)
    ) {
      validActions.push({
        type: REMOVE_ASSIGNMENT,
        method: REMOVE_ASSIGNMENT_METHOD,
        payload: { drawId, structureId, drawPosition },
      });

      if (!isByePosition) {
        validActions.push({
          type: WITHDRAW_PARTICIPANT,
          method: WITHDRAW_PARTICIPANT_METHOD,
          payload: { drawId, structureId, drawPosition },
        });
      }

      // in this case the ASSIGN_BYE_METHOD is called after removing assigned participant
      // option should not be available if exising assignment is a bye
      if (
        isAvailableAction({ policyActions, action: ASSIGN_BYE }) &&
        !isByePosition
      ) {
        validActions.push({
          type: ASSIGN_BYE,
          method: REMOVE_ASSIGNMENT_METHOD,
          payload: { drawId, structureId, drawPosition, replaceWithBye: true },
        });
      }
    }

    if (
      !isByePosition &&
      isAvailableAction({ policyActions, action: SEED_VALUE }) &&
      isValidSeedPosition({ drawDefinition, structureId, drawPosition })
    ) {
      const { seedAssignments } = getStructureSeedAssignments({
        drawDefinition,
        structure,
      });
      const { seedNumber, seedValue } =
        seedAssignments.find(
          (assignment) => assignment.participantId === participantId
        ) || {};

      validActions.push({
        type: SEED_VALUE,
        method: SEED_VALUE_METHOD,
        participant,
        payload: {
          drawId,
          structureId,
          participantId,
          seedNumber,
          seedValue,
        },
      });
    }

    if (!isByePosition && participantId) {
      if (isAvailableAction({ policyActions, action: SEED_VALUE })) {
        const addPenaltyAction = {
          type: ADD_PENALTY,
          method: ADD_PENALTY_METHOD,
          participant,
          payload: {
            drawId,
            penaltyCode: undefined,
            penaltyType: undefined,
            participantIds: [],
            notes: undefined,
          },
        };
        validActions.push(addPenaltyAction);
      }
      if (isAvailableAction({ policyActions, action: ADD_NICKNAME })) {
        const addNicknameAction = {
          type: ADD_NICKNAME,
          method: ADD_NICKNAME_METHOD,
          participant,
          payload: {
            participantId,
            otherName: undefined,
          },
        };
        validActions.push(addNicknameAction);
      }
    }

    if (isAvailableAction({ policyActions, action: SWAP_PARTICIPANTS })) {
      const { validSwapAction } = getValidSwapAction({
        drawId,
        drawPosition,
        structureId,
        isByePosition,
        byeDrawPositions,
        positionAssignments,
        activeDrawPositions,
        inactiveDrawPositions,
        tournamentParticipants,
      });
      if (validSwapAction) validActions.push(validSwapAction);
    }

    if (isAvailableAction({ policyActions, action: ALTERNATE_PARTICIPANT })) {
      const { validAlternatesAction } = getValidAlternatesAction({
        drawId,
        structure,
        structureId,
        drawPosition,
        drawDefinition,
        activeDrawPositions,
        positionAssignments,
        tournamentParticipants,
      });
      if (validAlternatesAction) validActions.push(validAlternatesAction);
    }
  }

  return {
    isByePosition,
    isActiveDrawPosition,
    isDrawPosition: true,
    hasPositionAssigned: !!positionAssignment,
    validActions,
  };
}

function getEnabledStructures({
  policyDefinition,
  tournamentRecord,
  drawDefinition,
  structure,
  event,
}) {
  const { policyDefinition: attachedPolicy } = getPolicyDefinition({
    policyType: POLICY_TYPE_POSITION_ACTIONS,
    tournamentRecord,
    drawDefinition,
    event,
  });

  policyDefinition =
    policyDefinition || attachedPolicy || POLICY_POSITION_ACTIONS_DEFAULT;

  const positionActionsPolicy = policyDefinition[POLICY_TYPE_POSITION_ACTIONS];

  const { enabledStructures, disabledStructures } = positionActionsPolicy || {};
  const actionsDisabled = disabledStructures?.find(
    (structurePolicy) =>
      structurePolicy.stages?.includes(structure.stage) &&
      (!structurePolicy.stageSequences?.length ||
        structurePolicy.stageSequences.includes(structure.stageSequence))
  );

  return { enabledStructures, actionsDisabled };
}

function getPolicyActions({ enabledStructures, structure }) {
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

function isAvailableAction({ action, policyActions }) {
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
