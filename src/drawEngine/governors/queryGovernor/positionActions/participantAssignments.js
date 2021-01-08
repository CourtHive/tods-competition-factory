import { findStructure } from '../../../getters/findStructure';
import { getNextSeedBlock } from '../../../getters/seedGetter';
import { getByesData } from '../../positionGovernor/positionByes';
import { getQualifiersData } from '../../positionGovernor/positionQualifiers';

import {
  ASSIGN_BYE,
  ASSIGN_BYE_METHOD,
  ASSIGN_PARTICIPANT,
  ASSIGN_PARTICIPANT_METHOD,
} from '../../../../constants/positionActionConstants';

export function getValidAssignmentAction({
  drawDefinition,
  structureId,
  drawPosition,
  isByePosition,
  positionAssignments,
  tournamentParticipants,
  unassignedParticipantIds,
}) {
  const { drawId } = drawDefinition;
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
          !assignment.participantId && !assignment.bye && !assignment.qualifier
      )
      .map((assignment) => assignment.drawPosition);
  }

  if (unfilledPositions.includes(drawPosition)) {
    const { structure } = findStructure({ drawDefinition, structureId });
    let availableParticipantIds;
    if (unplacedSeedAssignments.length) {
      // return any valid seedAssignments
      const validToAssign = unplacedSeedAssignments.filter((seedAssignment) =>
        unplacedSeedParticipantIds.includes(seedAssignment.participantId)
      );

      validToAssign.sort(validAssignmentsSort);
      availableParticipantIds = validToAssign.map(
        (assignment) => assignment.participantId
      );
    } else {
      // otherwise look for any unplaced entries
      // 1) unassigned DIRECT_ACCEPTANCE or WILDCARD structure entries
      availableParticipantIds = unassignedParticipantIds;

      // 2) unassigned qualifer entries
      const { unplacedQualifiersCount } = getQualifiersData({
        drawDefinition,
        structure,
      });
      if (unplacedQualifiersCount) console.log({ unplacedQualifiersCount });

      // 3) lucky losers from linked structures
    }

    const validAssignmentActions = [];
    const { byesCount, placedByes, positionsToAvoidDoubleBye } = getByesData({
      drawDefinition,
      structure,
    });
    const availableByes = byesCount - placedByes;
    // BYEs limit is being disabled
    if (/*availableByes &&*/ !isByePosition) {
      validAssignmentActions.push({
        type: ASSIGN_BYE,
        method: ASSIGN_BYE_METHOD,
        positionsToAvoidDoubleBye,
        availableByes,
        payload: { drawId, structureId, drawPosition },
      });
    }

    // add structureId and drawPosition to the payload so the client doesn't need to discover
    const participantsAvailable = tournamentParticipants?.filter(
      (participant) =>
        availableParticipantIds.includes(participant.participantId)
    );
    if (participantsAvailable?.length) {
      validAssignmentActions.push({
        type: ASSIGN_PARTICIPANT,
        method: ASSIGN_PARTICIPANT_METHOD,
        availableParticipantIds,
        participantsAvailable,
        positionsToAvoidDoubleBye,
        availableByes,
        payload: { drawId, structureId, drawPosition },
      });
    }
    return { validAssignmentActions };
  } else {
    return { message: 'No valid assignment actions' };
  }
}

function validAssignmentsSort(a, b) {
  if (a.bye) return -1;
  if (a.seedValue < b.seedValue || (a.seedValue && !b.seedValue)) return -1;
  return (a.drawOrder || 0) - (b.drawOrder || 0);
}
