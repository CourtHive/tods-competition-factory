import { makeDeepCopy } from '../../../../utilities';

import { MISSING_DRAW_ID } from '../../../../constants/errorConditionConstants';
import {
  SWAP_PARTICIPANTS,
  SWAP_PARTICIPANT_METHOD,
} from '../../../../constants/positionActionConstants';

export function getValidSwapAction({
  drawPosition,
  structureId,
  drawId,

  isByePosition,
  byeDrawPositions,
  positionAssignments,
  tournamentParticipants,

  onlyAssignedPositions = true,
  activeDrawPositions,
  inactiveDrawPositions,
}) {
  if (!drawId) return { error: MISSING_DRAW_ID, method: 'getValidSwapAction' };
  if (activeDrawPositions.includes(drawPosition)) return {};

  // assignmentCheck is used to filter out unassigned drawPositions
  const assignmentCheck = (assignment) =>
    !onlyAssignedPositions ||
    assignment.participantId ||
    assignment.qualifier ||
    assignment.bye;

  // availableDrawPositions filters out selectedDrawPosition
  // and if selectedDrawPosition is a BYE it filters out other drawPositions which are assigned BYEs
  const availableDrawPositions = inactiveDrawPositions?.filter(
    (position) =>
      position !== drawPosition &&
      !(isByePosition && byeDrawPositions.includes(position))
  );
  // filteredAssignments are all assignements which are availble and pass assignmentCheck
  const filteredAssignments = positionAssignments.filter(
    (assignment) =>
      assignmentCheck(assignment) &&
      availableDrawPositions?.includes(assignment.drawPosition)
  );

  // availableAssignmentsMap is used to attach participant object to all filteredAssignments
  // which have a participant assginment so the client/UI has all relevant drawPosition details
  const availableParticipantIds = filteredAssignments
    .map((assignment) => assignment.participantId)
    .filter((f) => f);
  const participantsAvailable = (
    tournamentParticipants || []
  ).filter((participant) =>
    availableParticipantIds.includes(participant.participantId)
  );
  const availableParticpantsMap = Object.assign(
    {},
    ...participantsAvailable.map((participant) => ({
      [participant.participantId]: participant,
    }))
  );

  const availableAssignments = filteredAssignments.map((assignment) => {
    const participant =
      availableParticpantsMap &&
      availableParticpantsMap[assignment.participantId];
    return Object.assign({}, assignment, {
      participant: makeDeepCopy(participant),
    });
  });

  if (availableAssignments.length) {
    const validSwapAction = {
      type: SWAP_PARTICIPANTS,
      method: SWAP_PARTICIPANT_METHOD,
      availableAssignments,
      payload: { drawId, structureId, drawPositions: [drawPosition] },
    };
    return { validSwapAction };
  }

  return {};
}
