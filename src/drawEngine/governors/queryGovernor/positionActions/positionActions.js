import { stageEntries } from '../../../getters/stageGetter';
import { getNextSeedBlock } from '../../../getters/seedGetter';
import { findStructure } from '../../../getters/findStructure';
import { structureAssignedDrawPositions } from '../../../getters/positionsGetter';
import { structureActiveDrawPositions } from '../../../getters/structureActiveDrawPositions';

import { getValidAlternatesAction } from './participantAlternates';
import { getValidAssignmentAction } from './participantAssignments';
import { getValidSwapAction } from './participantSwaps';

import {
  WILDCARD,
  DIRECT_ACCEPTANCE,
} from '../../../../constants/entryStatusConstants';
import {
  INVALID_DRAW_POSITION,
  MISSING_DRAW_DEFINITION,
  MISSING_DRAW_ID,
  MISSING_DRAW_POSITION,
  MISSING_STRUCTURE_ID,
  STRUCTURE_NOT_FOUND,
} from '../../../../constants/errorConditionConstants';
import {
  REMOVE_PARTICIPANT,
  REMOVE_PARTICIPANT_METHOD,
  ADD_NICKNAME,
  ADD_PENALTY,
} from '../../../../constants/positionActionConstants';
import { DRAW, LOSER } from '../../../../constants/drawDefinitionConstants';

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
  tournamentParticipants,
  drawDefinition,
  drawPosition,
  structureId,
  devContext,
  drawId,
}) {
  if (!drawId) return { error: MISSING_DRAW_ID };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (drawPosition === undefined) return { error: MISSING_DRAW_POSITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };

  const { structure } = findStructure({ drawDefinition, structureId });
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  const validActions = [];

  /**
   * If structure is > stageSequence 1 then it will only have valid position actions if:
   * 1. Links are directing winners to this structure, and
   * 2. the feedProfile is not "DRAW"
   *
   * Directions such as West in Compass or Playoff structures should not have an positionActions
   */
  if (structure.stageSequence > 1) {
    const asTargetLink = drawDefinition.links?.find(
      (link) => link.target.structureId === structureId
    );
    if (
      asTargetLink?.linkType === LOSER &&
      asTargetLink?.feedProfile !== DRAW
    ) {
      if (devContext) console.log('ss2 no valid actions');
      return { validActions };
    }
  }

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

  const isByePosition = !!(positionAssignment && positionAssignment.bye);
  const {
    activeDrawPositions,
    inactiveDrawPositions,
    byeDrawPositions,
  } = structureActiveDrawPositions({ drawDefinition, structureId });

  if (!positionAssignment) {
    const { validAssignmentAction } = getValidAssignmentAction({
      drawDefinition,
      structureId,
      drawPosition,
      positionAssignments,
      tournamentParticipants,
      unassignedParticipantIds,
    });
    if (validAssignmentAction) validActions.push(validAssignmentAction);
  } else {
    if (!activeDrawPositions.includes(drawPosition)) {
      validActions.push({
        type: REMOVE_PARTICIPANT,
        method: REMOVE_PARTICIPANT_METHOD,
        payload: { drawId, structureId, drawPosition },
      });
    }
    const isByeDrawPosition = byeDrawPositions.includes(drawPosition);
    if (!isByeDrawPosition) {
      validActions.push({ type: ADD_PENALTY });
      validActions.push({ type: ADD_NICKNAME });
    }
    const { validSwapAction } = getValidSwapAction({
      drawId,
      drawPosition,
      structureId,
      byeDrawPositions,
      positionAssignments,
      activeDrawPositions,
      inactiveDrawPositions,
      tournamentParticipants,
    });
    if (validSwapAction) validActions.push(validSwapAction);

    const { validAlternatesAction } = getValidAlternatesAction({
      drawId,
      structure,
      structureId,
      drawPosition,
      drawDefinition,
      positionAssignments,
      tournamentParticipants,
    });
    if (validAlternatesAction) validActions.push(validAlternatesAction);
  }

  return { validActions, isDrawPosition: true, isByePosition };
}

export function getNextUnfilledDrawPositions({ drawDefinition, structureId }) {
  if (!drawDefinition) {
    const error = MISSING_DRAW_DEFINITION;
    return { error, nextUnfilledDrawPositions: [] };
  }
  if (!structureId) {
    const error = MISSING_STRUCTURE_ID;
    return { error, nextUnfilledDrawPositions: [] };
  }

  const { structure, error } = findStructure({ drawDefinition, structureId });

  if (error) return { error };
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  const result = structureAssignedDrawPositions({ structure });
  const positionAssignments = result?.positionAssignments || [];
  const { unfilledPositions } = getNextSeedBlock({
    drawDefinition,
    structureId,
    randomize: true,
  });

  const unfilledDrawPositions = positionAssignments
    .filter((assignment) => {
      return (
        !assignment.participantId && !assignment.bye && !assignment.qualifier
      );
    })
    .map((assignment) => assignment.drawPosition);

  if (unfilledPositions?.length) {
    return { nextUnfilledDrawPositions: unfilledPositions };
  } else {
    return { nextUnfilledDrawPositions: unfilledDrawPositions };
  }
}
