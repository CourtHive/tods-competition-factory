import { getSourceStructureIdsDirectedBy } from '../../../getters/getSourceStructureIdsDirectedBy';
import { structureActiveDrawPositions } from '../../../getters/structureActiveDrawPositions';
import { getStructureSeedAssignments } from '../../../getters/getStructureSeedAssignments';
import { getAssignedParticipantIds } from '../../../getters/getAssignedParticipantIds';
import { structureAssignedDrawPositions } from '../../../getters/positionsGetter';
import { getValidLuckyLosersAction } from './getValidLuckyLoserAction';
import { getValidAlternatesAction } from './getValidAlternatesAction';
import { getValidAssignmentActions } from './participantAssignments';
import { isValidSeedPosition } from '../../../getters/seedGetter';
import { getStageEntries } from '../../../getters/stageGetter';
import { isCompletedStructure } from '../structureActions';
import { getValidSwapAction } from './getValidSwapAction';
import {
  getEnabledStructures,
  getPolicyActions,
  isAvailableAction,
} from './actionPolicyUtils';

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
export function positionActions({
  tournamentParticipants = [],
  policyDefinitions,
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
    error,
  } = structureActiveDrawPositions({
    tournamentRecord,
    drawDefinition,
    structureId,
  });

  if (error) return { error };

  const { enabledStructures, actionsDisabled } = getEnabledStructures({
    policyDefinitions,
    tournamentRecord,
    drawDefinition,
    structure,
    event,
  });

  const { sourceStructureIds: positionSourceStructureIds } =
    getSourceStructureIdsDirectedBy({
      drawDefinition,
      structureId,
      finishingPosition: WIN_RATIO,
      linkType: POSITION,
    }) || {};

  let sourceStructuresCompleted;
  if (positionSourceStructureIds?.length) {
    // EVERY: this can probably be changed to .every
    sourceStructuresCompleted = positionSourceStructureIds.reduce(
      (ready, sourceStructureId) => {
        const completed = isCompletedStructure({
          drawDefinition,
          structureId: sourceStructureId,
        });
        return completed && ready;
      },
      true
    );
  }

  const isWinRatioFedStructure = positionSourceStructureIds.length;
  const disablePlacementActions =
    positionSourceStructureIds.length && !sourceStructuresCompleted;

  const { policyActions } = getPolicyActions({ enabledStructures, structure });

  const possiblyDisablingAction =
    ![QUALIFYING, MAIN].includes(structure.stage) ||
    structure.stageSequence !== 1;

  const validActions = [];
  const { drawId } = drawDefinition;

  const { assignedPositions, positionAssignments } =
    structureAssignedDrawPositions({ structure });
  const positionAssignment = assignedPositions.find(
    (assignment) => assignment.drawPosition === drawPosition
  );

  const drawPositions = positionAssignments.map(
    (assignment) => assignment.drawPosition
  );

  if (!drawPositions?.includes(drawPosition))
    return { error: INVALID_DRAW_POSITION };

  const { stage, stageSequence } = structure;
  const entryStatuses = [DIRECT_ACCEPTANCE, WILDCARD];

  const stages = [stage];

  // allow unassigneParticipantIds from MAIN in positionActions for consolation
  if (stage === CONSOLATION) stages.push(MAIN);
  if (stage === MAIN) stages.push(CONSOLATION);

  const stageEntries = getStageEntries({
    drawDefinition,
    stageSequence,
    entryStatuses,
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
  const isActiveDrawPosition = activeDrawPositions.includes(drawPosition);

  if (actionsDisabled)
    return {
      message: 'Actions Disabled for structure',
      isByePosition,
      isActiveDrawPosition,
      isDrawPosition: true,
      hasPositionAssigned: !!positionAssignment,
      validActions: [],
    };

  if (
    isAvailableAction({ policyActions, action: ASSIGN_PARTICIPANT }) &&
    !isActiveDrawPosition &&
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
      activeDrawPositions,
      policyDefinitions,
      drawDefinition,
      isByePosition,
      drawPosition,
      structureId,
      structure,
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
        drawId,
        structure,
        structureId,
        drawPosition,
        isByePosition,
        drawDefinition,
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

  if (
    isAvailableAction({ policyActions, action: ALTERNATE_PARTICIPANT }) &&
    !disablePlacementActions
  ) {
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
  if (
    isAvailableAction({ policyActions, action: LUCKY_PARTICIPANT }) &&
    !disablePlacementActions
  ) {
    const { validLuckyLosersAction } = getValidLuckyLosersAction({
      drawId,
      structure,
      structureId,
      drawPosition,
      drawDefinition,
      activeDrawPositions,
      positionAssignments,
      isWinRatioFedStructure,
      tournamentParticipants,
      possiblyDisablingAction,
    });
    if (validLuckyLosersAction) validActions.push(validLuckyLosersAction);
  }

  return {
    isByePosition,
    isActiveDrawPosition,
    isDrawPosition: true,
    hasPositionAssigned: !!positionAssignment,
    validActions,
  };
}
