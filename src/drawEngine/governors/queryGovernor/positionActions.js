import { stageEntries } from '../../getters/stageGetter';
import { getNextSeedBlock } from '../../getters/seedGetter';
import { findStructure } from '../../getters/findStructure';
import { getByesData } from '../../governors/positionGovernor/positionByes';
import { getQualifiersData } from '../../governors/positionGovernor/positionQualifiers';
import {
  structureAssignedDrawPositions,
  structureActiveDrawPositions,
} from '../../getters/positionsGetter';

import {
  WILDCARD,
  DIRECT_ACCEPTANCE,
} from '../../../constants/drawDefinitionConstants';

/*
  return an array of all possible validActions for a given drawPosition within a structure
*/
export function positionActions({
  drawDefinition,
  participantId,
  policies,
  structureId,
  drawPosition,
}) {
  const { structure } = findStructure({ drawDefinition, structureId });

  const validActions = [];

  if (!structure) {
    console.log('no structure found', {
      drawDefinition,
      structureId,
      drawPosition,
      participantId,
    });
    return { validActions };
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
      policies,
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

export function getNextUnfilledDrawPositions({
  drawDefinition,
  policies,
  structureId,
}) {
  const { structure, error } = findStructure({ drawDefinition, structureId });
  if (error) return { error };
  if (!structure) return { error: 'No structure found' };
  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const { unfilledPositions } = getNextSeedBlock({
    policies,
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
