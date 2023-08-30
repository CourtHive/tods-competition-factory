import { getAllStructureMatchUps } from '../../../getters/getMatchUps/getAllStructureMatchUps';
import { definedAttributes } from '../../../../utilities/objects';
import { overlap, makeDeepCopy } from '../../../../utilities';

import {
  SWAP_PARTICIPANTS,
  SWAP_PARTICIPANT_METHOD,
} from '../../../../constants/positionActionConstants';

export function getValidSwapAction({
  onlyAssignedPositions = true,
  possiblyDisablingAction,
  tournamentParticipants,
  inactiveDrawPositions,
  activeDrawPositions,
  positionAssignments,
  returnParticipants,
  byeDrawPositions,
  drawDefinition,
  isByePosition,
  drawPosition,
  structureId,
  structure,
  drawId,
  event,
}) {
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
  const filteredAssignments =
    positionAssignments?.filter(
      (assignment) =>
        assignmentCheck(assignment) &&
        availableDrawPositions?.includes(assignment.drawPosition)
    ) || [];

  // get relevant drawPositions => relevantMatchUps => sides => sourceDrawPositionRanges
  const filteredDrawPositions = filteredAssignments.map(
    ({ drawPosition }) => drawPosition
  );
  const { matchUps } = getAllStructureMatchUps({
    afterRecoveryTimes: false,
    inContext: true,
    drawDefinition,
    structure,
    event,
  });
  const relevantMatchUps = matchUps.filter(({ drawPositions }) =>
    overlap(drawPositions, filteredDrawPositions)
  );
  const sourceDrawPositionRangeMap = Object.assign(
    {},
    ...relevantMatchUps
      .map((matchUp) => {
        return matchUp.sides
          ?.filter(({ sourceDrawPositionRange }) => sourceDrawPositionRange)
          .map(({ drawPosition, sourceDrawPositionRange }) => ({
            [drawPosition]: sourceDrawPositionRange,
          }));
      })
      .flat()
  );

  // availableAssignmentsMap is used to attach participant object to all filteredAssignments
  // which have a participant assginment so the client/UI has all relevant drawPosition details
  const availableParticipantIds = filteredAssignments
    .map((assignment) => assignment.participantId)
    .filter(Boolean);
  const participantsAvailable = (tournamentParticipants || []).filter(
    (participant) => availableParticipantIds.includes(participant.participantId)
  );
  const availableParticipantsMap = Object.assign(
    {},
    ...participantsAvailable.map((participant) => ({
      [participant.participantId]: participant,
    }))
  );

  const availableAssignments = filteredAssignments.map((assignment) => {
    const participant = availableParticipantsMap?.[assignment.participantId];

    const sourceDrawPositionRange =
      sourceDrawPositionRangeMap[assignment.drawPosition];

    return definedAttributes({
      ...assignment,
      participant: returnParticipants
        ? makeDeepCopy(participant, false, true)
        : undefined,
      sourceDrawPositionRange,
    });
  });

  if (availableAssignments.length) {
    const validSwapAction = {
      payload: { drawId, structureId, drawPositions: [drawPosition] },
      willDisableLinks: possiblyDisablingAction,
      method: SWAP_PARTICIPANT_METHOD,
      type: SWAP_PARTICIPANTS,
      availableAssignments,
    };
    return { validSwapAction };
  }

  return {};
}
