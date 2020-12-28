import {
  ASSIGN_PARTICIPANT,
  ASSIGN_PARTICIPANT_METHOD,
} from '../../../../constants/positionActionConstants';
import { getNextSeedBlock } from '../../../getters/seedGetter';

export function getValidAssignmentAction({
  drawDefinition,
  structureId,
  drawPosition,
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
      availableParticipantIds = unassignedParticipantIds;
      // look for:
      // 1) unassigned DIRECT_ACCEPTANCE or WILDCARD structure entries
      // 2) unassigned qualifer entries
      // 3) lucky losers from linked structures
      // first add any unassigned participants
      /*
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
      */
    }
    // add structureId and drawPosition to the payload so the client doesn't need to discover
    const participantsAvailable = tournamentParticipants?.filter(
      (participant) =>
        availableParticipantIds.includes(participant.participantId)
    );
    const validAssignmentAction = {
      type: ASSIGN_PARTICIPANT,
      method: ASSIGN_PARTICIPANT_METHOD,
      availableParticipantIds,
      participantsAvailable,
      payload: { drawId, structureId, drawPosition },
    };
    return { validAssignmentAction };
  } else {
    return { message: 'No valid assignment actions' };
  }
}

function validAssignmentsSort(a, b) {
  if (a.bye) return -1;
  if (a.seedValue < b.seedValue || (a.seedValue && !b.seedValue)) return -1;
  return (a.drawOrder || 0) - (b.drawOrder || 0);
}
