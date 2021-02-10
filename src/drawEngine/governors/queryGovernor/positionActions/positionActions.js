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
} from '../../../../constants/positionActionConstants';
import { MAIN } from '../../../../constants/drawDefinitionConstants';

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
  drawDefinition,
  drawPosition,
  structureId,
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
  const isMainStageSequence1 =
    structure.stage === MAIN && structure.stageSequence === 1;

  let allowConsolationMovementActions = false;

  const validActions = [];
  const { drawId } = drawDefinition;

  const {
    assignedPositions,
    positionAssignments,
  } = structureAssignedDrawPositions({ structure });
  const positionAssignment = assignedPositions.reduce(
    (positionAssignment, assignment) => {
      return assignment.drawPosition === drawPosition
        ? assignment
        : positionAssignment;
    },
    undefined
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

  // if (isMainStageSequence1 && (!positionAssignment || isByePosition)) {
  if (
    (isMainStageSequence1 || allowConsolationMovementActions) &&
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
      (allowConsolationMovementActions || isMainStageSequence1) &&
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
        (allowConsolationMovementActions || isMainStageSequence1) &&
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
      const addNicknameAction = {
        type: ADD_NICKNAME,
        method: ADD_NICKNAME_METHOD,
        participant,
        payload: {
          participantId,
          otherName: undefined,
        },
      };
      validActions.push(addPenaltyAction);
      validActions.push(addNicknameAction);
    }

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
    if (
      (allowConsolationMovementActions || isMainStageSequence1) &&
      validSwapAction
    ) {
      validActions.push(validSwapAction);
    }

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
    if (
      (allowConsolationMovementActions || isMainStageSequence1) &&
      validAlternatesAction
    ) {
      validActions.push(validAlternatesAction);
    }
  }

  return {
    isByePosition,
    isActiveDrawPosition,
    isDrawPosition: true,
    validActions,
  };
}
