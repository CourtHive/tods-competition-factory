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
  DRAW,
  LOSER,
} from '../../../constants/drawDefinitionConstants';

/*
  return an array of all possible validActions for a given drawPosition within a structure
*/
export function positionActions({
  devContext,
  structureId,
  drawPosition,
  participantId,
  drawDefinition,
}) {
  const { structure } = findStructure({ drawDefinition, structureId });

  const validActions = [];

  if (!structure) {
    if (devContext) {
      console.log('no structure found', {
        drawDefinition,
        structureId,
        drawPosition,
        participantId,
      });
    }
    return { validActions };
  }

  /**
   * If structure is > stageSequence 1 then it will only have valid position actions if:
   * 1. Links are directing winners to this structure, and
   * 2. the feedProfile is not "DRAW"
   *
   * Directions such as West in Compass or Playoff structures should not have an positionActions
   */
  if (structure.stageSequence > 1) {
    const asTargetLink = drawDefinition.links?.find(
      link => link.target.structureId === structureId
    );
    if (
      asTargetLink?.linkSubject === LOSER &&
      asTargetLink?.feedProfile !== DRAW
    ) {
      if (devContext) console.log('ss2 no valid actions');
      return { validActions };
    }
  }

  const { assignedPositions } = structureAssignedDrawPositions({ structure });
  const positionAssignment = assignedPositions.reduce(
    (positionAssignment, assignment) => {
      return assignment.drawPosition === drawPosition
        ? assignment
        : positionAssignment;
    },
    undefined
  );

  const { drawId } = drawDefinition;
  const isByePosition = positionAssignment && positionAssignment.bye;

  if (!positionAssignment) {
    const {
      unplacedSeedParticipantIds,
      unfilledPositions,
      unplacedSeedAssignments,
    } = getNextSeedBlock({
      drawDefinition,
      structureId,
      randomize: true,
    });

    // add structureId and drawPosition to the payload so the client doesn't need to discover
    if (unfilledPositions.includes(drawPosition)) {
      const validToAssign = unplacedSeedAssignments
        .filter(seedAssignment =>
          unplacedSeedParticipantIds.includes(seedAssignment.participantId)
        )
        .map(valid =>
          Object.assign(valid, { drawId, structureId, drawPosition })
        );

      validToAssign.sort(validAssignmentsSort);
      console.log({
        validToAssign,
        unfilledPositions,
        unplacedSeedAssignments,
        structure,
      });
      validActions.push({ type: 'ASSIGNMENT', payload: { validToAssign } });
    } else if (unfilledPositions.length === 0) {
      const { stage, stageSequence } = structure;
      const entryTypes = [DIRECT_ACCEPTANCE, WILDCARD];
      const entries = stageEntries({
        drawDefinition,
        stage,
        stageSequence,
        entryTypes,
      });
      const assignedParticipantIds = assignedPositions.map(
        assignment => assignment.participantId
      );

      // first add any unassigned participants
      const validToAssign = entries
        .filter(entry => !assignedParticipantIds.includes(entry.participantId))
        .map(valid =>
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
      validActions.push({ type: 'ASSIGNMENT', payload: { validToAssign } });
    }
  } else {
    const {
      activeDrawPositions,
      byeDrawPositions,
    } = structureActiveDrawPositions({ drawDefinition, structureId });
    if (!activeDrawPositions.includes(drawPosition)) {
      validActions.push({
        type: 'REMOVE',
        payload: { drawId, structureId, drawPosition },
      });
    }
    const isByeDrawPosition = byeDrawPositions.includes(drawPosition);
    if (!isByeDrawPosition) {
      validActions.push({ type: 'PENALTY' });
      validActions.push({ type: 'NICKNAME' });
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
  const { structure, error } = findStructure({ drawDefinition, structureId });
  if (error) return { error };
  if (!structure) return { error: 'No structure found' };
  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const { unfilledPositions } = getNextSeedBlock({
    drawDefinition,
    structureId,
    randomize: true,
  });

  const unfilledDrawPositions = positionAssignments
    .filter(assignment => {
      return (
        !assignment.participantId && !assignment.bye && !assignment.qualifier
      );
    })
    .map(assignment => assignment.drawPosition);

  if (unfilledPositions.length) {
    return { nextUnfilledDrawPositions: unfilledPositions };
  } else {
    return { nextUnfilledDrawPositions: unfilledDrawPositions };
  }
}
