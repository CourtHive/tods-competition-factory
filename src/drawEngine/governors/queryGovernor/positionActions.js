import { getByesData } from '../../governors/positionGovernor/positionByes';
import { getQualifiersData } from '../../governors/positionGovernor/positionQualifiers';

import { stageEntries } from '../../getters/stageGetter';
import { getNextSeedBlock } from '../../getters/seedGetter';
import { findStructure } from '../../getters/findStructure';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { structureActiveDrawPositions } from '../../getters/structureActiveDrawPositions';

import {
  WILDCARD,
  DIRECT_ACCEPTANCE,
} from '../../../constants/entryStatusConstants';
import {
  INVALID_DRAW_POSITION,
  MISSING_DRAW_DEFINITION,
  MISSING_DRAW_ID,
  MISSING_DRAW_POSITION,
  MISSING_STRUCTURE_ID,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import {
  ASSIGN_PARTICIPANT,
  REMOVE_PARTICIPANT,
  ASSIGN_PARTICIPANT_METHOD,
  REMOVE_PARTICIPANT_METHOD,
  ADD_NICKNAME,
  ADD_PENALTY,
} from '../../../constants/positionActionConstants';
import { DRAW, LOSER } from '../../../constants/drawDefinitionConstants';

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

  if (!positionAssignment) {
    const result = getNextSeedBlock({
      drawDefinition,
      structureId,
      randomize: true,
    });
    const { unplacedSeedParticipantIds, unplacedSeedAssignments } = result;
    let { unfilledPositions } = result;

    if (!unfilledPositions.length) {
      unfilledPositions = positionAssignments
        .filter(
          (assignment) =>
            !assignment.participantId &&
            !assignment.bye &&
            !assignment.qualifier
        )
        .map((assignment) => assignment.drawPosition);
    }
    // add structureId and drawPosition to the payload so the client doesn't need to discover
    if (unfilledPositions.includes(drawPosition)) {
      const payload = { drawId, structureId, drawPosition };
      if (unplacedSeedAssignments.length) {
        // return any valid seedAssignments
        const validToAssign = unplacedSeedAssignments.filter((seedAssignment) =>
          unplacedSeedParticipantIds.includes(seedAssignment.participantId)
        );

        validToAssign.sort(validAssignmentsSort);
        const availableParticipantIds = validToAssign.map(
          (assignment) => assignment.participantId
        );
        validActions.push({
          type: ASSIGN_PARTICIPANT,
          method: ASSIGN_PARTICIPANT_METHOD,
          availableParticipantIds,
          payload,
        });
      } else {
        // otherwise look for any unplaced entries
        const availableParticipantIds = unassignedParticipantIds;
        validActions.push({
          type: ASSIGN_PARTICIPANT,
          method: ASSIGN_PARTICIPANT_METHOD,
          availableParticipantIds,
          payload,
        });
      }
    } else if (unfilledPositions.length === 0) {
      // first add any unassigned participants
      const validToAssign = entries
        .filter(
          (entry) => !assignedParticipantIds.includes(entry.participantId)
        )
        .map((valid) =>
          Object.assign(valid, { drawId, structureId, drawPosition })
        );

      // discover how many byes are unplaced
      const { byesCount, placedByes, validByePositions } = getByesData({
        drawDefinition,
        structure,
      });
      const validPositionForBye = validByePositions.includes(drawPosition);
      const unassignedByes = byesCount - placedByes;
      if (validPositionForBye && unassignedByes) {
        validToAssign.push({
          bye: true,
          unassignedByes,
          drawId,
          structureId,
          drawPosition,
        });
      }

      // discover how many qualifiers are unplaced
      const { unplacedQualifiersCount } = getQualifiersData({
        drawDefinition,
        structure,
      });
      console.log({ unplacedQualifiersCount });

      validToAssign.sort(validAssignmentsSort);
      validActions.push({
        type: ASSIGN_PARTICIPANT,
        payload: { validToAssign },
      });
    }
  } else {
    const {
      activeDrawPositions,
      byeDrawPositions,
    } = structureActiveDrawPositions({ drawDefinition, structureId });
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
  }
  return { validActions, isDrawPosition: true, isByePosition };
}

function validAssignmentsSort(a, b) {
  if (a.bye) return -1;
  if (a.seedValue < b.seedValue || (a.seedValue && !b.seedValue)) return -1;
  return (a.drawOrder || 0) - (b.drawOrder || 0);
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
