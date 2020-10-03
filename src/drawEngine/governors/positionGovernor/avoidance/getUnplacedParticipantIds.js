/**
 *
 * @param {string[]} participantIds
 * @param {string[]} positionAssignments - assignment objects which associate drawPositions with participantIds
 *
 * Returns an array of participantsIds which have not been assigned
 */

export function getUnplacedParticipantIds({
  participantIds,
  positionAssignments,
}) {
  const assignedParticipantIds = positionAssignments.map(
    assignment => assignment.participantId
  );
  return participantIds.filter(
    participantId => !assignedParticipantIds.includes(participantId)
  );
}
