import { getSourceStructureIdsAndRelevantLinks } from '../../../getters/getSourceStructureIdsAndRelevantLinks';
import { getStructureDrawPositionProfiles } from '../../../getters/getStructureDrawPositionProfiles';
import { getAppliedPolicies } from '../../../../global/functions/deducers/getAppliedPolicies';
import { getStructureSeedAssignments } from '../../../getters/getStructureSeedAssignments';
import { getAssignedParticipantIds } from '../../../getters/getAssignedParticipantIds';
import { getValidModifyAssignedPairAction } from './getValidModifyAssignedPairAction';
import { structureAssignedDrawPositions } from '../../../getters/positionsGetter';
import { getValidLuckyLosersAction } from './getValidLuckyLoserAction';
import { getValidAlternatesAction } from './getValidAlternatesAction';
import { getValidAssignmentActions } from './participantAssignments';
import { getValidQualifiersAction } from './getValidQualifiersAction';
import { isValidSeedPosition } from '../../../getters/seedGetter';
import { getStageEntries } from '../../../getters/stageGetter';
import { findStructure } from '../../../getters/findStructure';
import { isCompletedStructure } from '../structureActions';
import { getValidSwapAction } from './getValidSwapAction';
import { matchUpActions } from '../matchUpActions';
import {
  activePositionsCheck,
  getEnabledStructures,
  getPolicyActions,
  isAvailableAction,
  POSITION_ACTION,
} from './actionPolicyUtils';

import { DIRECT_ENTRY_STATUSES } from '../../../../constants/entryStatusConstants';
import { PAIR } from '../../../../constants/participantConstants';
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
  QUALIFYING_PARTICIPANT,
  MODIFY_PAIR_ASSIGNMENT,
  REMOVE_SEED,
  REMOVE_SEED_METHOD,
} from '../../../../constants/positionActionConstants';
import {
  CONSOLATION,
  MAIN,
  POSITION,
  QUALIFYING,
  WIN_RATIO,
} from '../../../../constants/drawDefinitionConstants';

/**
 *
 * return an array of all possible validActions for a given drawPosition within a structure
 *
 * @param {object} drawDefinition - passed in automatically by drawEngine if state has been set
 * @param {number} drawPosition - number of drawPosition for which actions are to be returned
 * @param {string} structureId - id of structure of drawPosition
 *
 */
export function positionActions(params) {
  const {
    policyDefinitions: specifiedPolicyDefinitions,
    tournamentParticipants = [],
    returnParticipants = true,
    provisionalPositioning,
    tournamentRecord,
    drawDefinition,
    drawPosition,
    event,
  } = params;

  if (!event) return { error: MISSING_EVENT };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!params.structureId) return { error: MISSING_STRUCTURE_ID };

  let result: any = findStructure({
    structureId: params.structureId,
    drawDefinition,
  });
  if (result.error) return result;

  const structure = result.containingStructure || result.structure;
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  const structureId = structure.structureId;

  result = getStructureDrawPositionProfiles({
    drawDefinition,
    structureId,
  });

  if (drawPosition === undefined && !result.isAdHoc) {
    return { error: MISSING_DRAW_POSITION };
  }

  if (result.isAdHoc) return matchUpActions(params);
  if (result.error) return result;

  const {
    drawPositionInitialRounds,
    // qualifyingDrawPositions,
    inactiveDrawPositions,
    activeDrawPositions,
    byeDrawPositions,
  } = result;

  const { appliedPolicies } = getAppliedPolicies({
    tournamentRecord,
    drawDefinition,
    structure,
    event,
  });

  Object.assign(appliedPolicies, specifiedPolicyDefinitions || {});

  const {
    actionsPolicy: positionActionsPolicy,
    enabledStructures,
    actionsDisabled,
  } = getEnabledStructures({
    actionType: POSITION_ACTION,
    appliedPolicies,
    drawDefinition,
    structure,
  });

  const activePositionOverrides =
    positionActionsPolicy?.activePositionOverrides || [];

  // targetRoundNumber will be > 1 for fed positions
  const { sourceStructureIds: positionSourceStructureIds } =
    getSourceStructureIdsAndRelevantLinks({
      finishingPosition: WIN_RATIO,
      targetRoundNumber: 1,
      linkType: POSITION,
      drawDefinition,
      structureId,
    }) || {};

  let sourceStructuresComplete;
  if (positionSourceStructureIds?.length) {
    // EVERY: this can probably be changed to .every
    sourceStructuresComplete = positionSourceStructureIds.reduce(
      (ready, sourceStructureId) => {
        const completed = isCompletedStructure({
          structureId: sourceStructureId,
          drawDefinition,
        });
        return completed && ready;
      },
      true
    );
  }

  const isWinRatioFedStructure = positionSourceStructureIds.length;
  const disablePlacementActions =
    positionSourceStructureIds.length && !sourceStructuresComplete;

  const { policyActions } = getPolicyActions({
    enabledStructures,
    drawDefinition,
    structure,
  });

  const possiblyDisablingAction =
    ![QUALIFYING, MAIN].includes(structure.stage) ||
    structure.stageSequence !== 1;

  const { drawId } = drawDefinition;
  const validActions: any[] = [];

  const { assignedPositions, positionAssignments } =
    structureAssignedDrawPositions({ structure });
  const positionAssignment = assignedPositions?.find(
    (assignment) => assignment.drawPosition === drawPosition
  );

  const drawPositions = positionAssignments?.map(
    (assignment) => assignment.drawPosition
  );

  if (!drawPositions?.includes(drawPosition))
    return { error: INVALID_DRAW_POSITION };

  const { stage, stageSequence } = structure;

  const stages = [stage];

  // allow unassigneParticipantIds from MAIN in positionActions for consolation
  if (stage === CONSOLATION) stages.push(MAIN);
  if (stage === MAIN) stages.push(CONSOLATION);

  const stageEntries = getStageEntries({
    entryStatuses: DIRECT_ENTRY_STATUSES,
    provisionalPositioning,
    drawDefinition,
    stageSequence,
    structureId,
    stages,
  });

  const stageAssignedParticipantIds = getAssignedParticipantIds({
    drawDefinition,
    stages,
  });

  const unassignedParticipantIds = stageEntries
    .filter(
      (entry) => !stageAssignedParticipantIds.includes(entry.participantId)
    )
    .map((entry) => entry.participantId);

  const isByePosition = byeDrawPositions.includes(drawPosition);
  // const isQualifierPosition = qualifyingDrawPositions.includes(drawPosition);
  const isActiveDrawPosition = activeDrawPositions.includes(drawPosition);

  if (actionsDisabled)
    return {
      info: 'Actions Disabled for structure',
      isByePosition,
      isActiveDrawPosition,
      isDrawPosition: true,
      hasPositionAssigned: !!positionAssignment,
      validActions: [],
    };

  if (
    isAvailableAction({ policyActions, action: ASSIGN_PARTICIPANT }) &&
    !isActiveDrawPosition &&
    positionAssignments &&
    !disablePlacementActions &&
    (!positionAssignment || isByePosition)
  ) {
    const { validAssignmentActions } = getValidAssignmentActions({
      positionSourceStructureIds,
      unassignedParticipantIds,
      possiblyDisablingAction,
      isWinRatioFedStructure,
      tournamentParticipants,
      positionAssignments,
      returnParticipants,
      appliedPolicies,
      drawDefinition,
      isByePosition,
      drawPosition,
      structureId,
      event,
    });
    validAssignmentActions?.forEach((action) => validActions.push(action));
  }

  if (isAvailableAction({ policyActions, action: QUALIFYING_PARTICIPANT })) {
    const { validAssignmentActions } = getValidQualifiersAction({
      drawPositionInitialRounds,
      tournamentParticipants,
      positionAssignments,
      returnParticipants,
      appliedPolicies,
      drawDefinition,
      drawPosition,
      structureId,
      drawId,
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
      !isActiveDrawPosition
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

    const validToAssignSeed =
      structure.stage === QUALIFYING ||
      (structure.stage === MAIN && structure.stageSequence === 1);

    if (
      !isByePosition &&
      // if any drawPositions are active, action is disabled unless override in policy
      activePositionsCheck({
        activePositionOverrides,
        activeDrawPositions,
        action: SEED_VALUE,
      }) &&
      isAvailableAction({ policyActions, action: SEED_VALUE }) &&
      isValidSeedPosition({ drawDefinition, structureId, drawPosition }) &&
      validToAssignSeed
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
        seedNumber,
        payload: {
          drawId,
          structureId,
          participantId,
          seedValue,
        },
      });
    }

    if (
      !isByePosition &&
      // if any drawPositions are active, action is disabled unless override in policy
      activePositionsCheck({
        activePositionOverrides,
        activeDrawPositions,
        action: REMOVE_SEED,
      }) &&
      isAvailableAction({ policyActions, action: REMOVE_SEED }) &&
      isValidSeedPosition({ drawDefinition, structureId, drawPosition }) &&
      validToAssignSeed
    ) {
      const { seedAssignments } = getStructureSeedAssignments({
        drawDefinition,
        structure,
      });
      const { seedNumber } =
        seedAssignments.find(
          (assignment) => assignment.participantId === participantId
        ) || {};

      validActions.push({
        type: REMOVE_SEED,
        method: REMOVE_SEED_METHOD,
        participant,
        seedNumber,
        payload: {
          drawId,
          structureId,
          participantId,
        },
      });
    }

    if (!isByePosition && participantId) {
      if (isAvailableAction({ policyActions, action: ADD_PENALTY })) {
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
        possiblyDisablingAction,
        tournamentParticipants,
        inactiveDrawPositions,
        activeDrawPositions,
        positionAssignments,
        returnParticipants,
        byeDrawPositions,
        drawDefinition,
        isByePosition,
        drawPosition,
        structureId,
        structure,
        drawId,
      });
      if (validSwapAction) validActions.push(validSwapAction);
    }
  }

  if (
    isAvailableAction({ policyActions, action: ALTERNATE_PARTICIPANT }) &&
    !disablePlacementActions
  ) {
    const { validAlternatesAction } = getValidAlternatesAction({
      possiblyDisablingAction,
      tournamentParticipants,
      positionAssignments,
      activeDrawPositions,
      returnParticipants,
      appliedPolicies,
      drawDefinition,
      drawPosition,
      validActions,
      structureId,
      structure,
      drawId,
      event,
    });
    if (validAlternatesAction) validActions.push(validAlternatesAction);
  }

  if (
    isAvailableAction({ policyActions, action: LUCKY_PARTICIPANT }) &&
    !disablePlacementActions &&
    positionAssignments
  ) {
    const { validLuckyLosersAction } = getValidLuckyLosersAction({
      sourceStructuresComplete,
      possiblyDisablingAction,
      isWinRatioFedStructure,
      tournamentParticipants,
      activeDrawPositions,
      positionAssignments,
      drawDefinition,
      drawPosition,
      structureId,
      structure,
      drawId,
    });
    if (validLuckyLosersAction) validActions.push(validLuckyLosersAction);
  }

  if (
    participant?.participantType === PAIR &&
    isAvailableAction({ policyActions, action: MODIFY_PAIR_ASSIGNMENT })
  ) {
    const { validModifyAssignedPairAction } = getValidModifyAssignedPairAction({
      tournamentParticipants,
      returnParticipants,
      drawPosition,
      participant,
      drawId,
      event,
    });
    if (validModifyAssignedPairAction)
      validActions.push(validModifyAssignedPairAction);
  }

  return {
    hasPositionAssigned: !!positionAssignment,
    isActiveDrawPosition,
    isDrawPosition: true,
    isByePosition,
    validActions,
  };
}
