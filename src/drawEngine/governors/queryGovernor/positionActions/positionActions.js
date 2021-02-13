import { structureActiveDrawPositions } from '../../../getters/structureActiveDrawPositions';
import { getStructureSeedAssignments } from '../../../getters/getStructureSeedAssignments';
import { getValidAssignmentActions } from './participantAssignments';
import { getValidLuckyLosersAction } from './getValidLuckyLoserAction';
import { getValidAlternatesAction } from './getValidAlternatesAction';
import { isValidSeedPosition } from '../../../getters/seedGetter';
import { getStageEntries } from '../../../getters/stageGetter';
import { getValidSwapAction } from './getValidSwapAction';
import {
  getStageAssignedParticipantIds,
  structureAssignedDrawPositions,
} from '../../../getters/positionsGetter';

import {
  WILDCARD,
  DIRECT_ACCEPTANCE,
} from '../../../../constants/entryStatusConstants';
import {
  INVALID_DRAW_POSITION,
  MISSING_DRAW_DEFINITION,
  MISSING_DRAW_POSITION,
  MISSING_EVENT,
  MISSING_STRUCTURE_ID,
  STRUCTURE_NOT_FOUND,
} from '../../../../constants/errorConditionConstants';
import {
  ADD_NICKNAME_METHOD,
  ADD_NICKNAME,
  ADD_PENALTY_METHOD,
  ADD_PENALTY,
  ALTERNATE_PARTICIPANT,
  ASSIGN_BYE,
  ASSIGN_PARTICIPANT,
  LUCKY_PARTICIPANT,
  REMOVE_ASSIGNMENT_METHOD,
  REMOVE_ASSIGNMENT,
  SEED_VALUE_METHOD,
  SEED_VALUE,
  SWAP_PARTICIPANTS,
  WITHDRAW_PARTICIPANT_METHOD,
  WITHDRAW_PARTICIPANT,
} from '../../../../constants/positionActionConstants';
import {
  CONSOLATION,
  MAIN,
  QUALIFYING,
} from '../../../../constants/drawDefinitionConstants';
import {
  getEnabledStructures,
  getPolicyActions,
  isAvailableAction,
} from './actionPolicyUtils';

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
  if (!event) return { error: MISSING_EVENT };
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

  const possiblyDisablingAction =
    ![QUALIFYING, MAIN].includes(structure.stage) ||
    structure.stageSequence !== 1;

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

  const stages = [stage];

  // allow unassigneParticipantIds from MAIN in positionActions for consolation
  if (stage === CONSOLATION) stages.push(MAIN);
  if (stage === MAIN) stages.push(CONSOLATION);

  const stageEntries = getStageEntries({
    drawDefinition,
    stageSequence,
    structureId,
    entryTypes,
    stages,
  });

  const stageAssignedParticipantIds = getStageAssignedParticipantIds({
    drawDefinition,
    stages,
  });
  /*
  const assignedParticipantIds = assignedPositions.map(
    (assignment) => assignment.participantId
  );
  */
  const unassignedParticipantIds = stageEntries
    .filter(
      (entry) => !stageAssignedParticipantIds.includes(entry.participantId)
    )
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
      possiblyDisablingAction,
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
        willDisableLinks: possiblyDisablingAction,
      });

      if (!isByePosition) {
        validActions.push({
          type: WITHDRAW_PARTICIPANT,
          method: WITHDRAW_PARTICIPANT_METHOD,
          payload: { drawId, structureId, drawPosition },
          willDisableLinks: possiblyDisablingAction,
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
          willDisableLinks: possiblyDisablingAction,
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
        possiblyDisablingAction,
      });
      if (validSwapAction) validActions.push(validSwapAction);
    }
  }

  if (isAvailableAction({ policyActions, action: ALTERNATE_PARTICIPANT })) {
    const { validAlternatesAction } = getValidAlternatesAction({
      event,
      drawId,
      structure,
      structureId,
      drawPosition,
      drawDefinition,
      activeDrawPositions,
      positionAssignments,
      tournamentParticipants,
      possiblyDisablingAction,
    });
    if (validAlternatesAction) validActions.push(validAlternatesAction);
  }
  if (isAvailableAction({ policyActions, action: LUCKY_PARTICIPANT })) {
    const { validAlternatesAction } = getValidLuckyLosersAction({
      drawId,
      structure,
      structureId,
      drawPosition,
      drawDefinition,
      activeDrawPositions,
      positionAssignments,
      tournamentParticipants,
      possiblyDisablingAction,
    });
    if (validAlternatesAction) validActions.push(validAlternatesAction);
  }

  return {
    isByePosition,
    isActiveDrawPosition,
    isDrawPosition: true,
    hasPositionAssigned: !!positionAssignment,
    validActions,
  };
}
