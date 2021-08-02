import { getAllStructureMatchUps } from '../../../getters/getMatchUps/getAllStructureMatchUps';
import { overlap, makeDeepCopy } from '../../../../utilities';

import { MISSING_DRAW_ID } from '../../../../constants/errorConditionConstants';
import {
  SWAP_PARTICIPANTS,
  SWAP_PARTICIPANT_METHOD,
} from '../../../../constants/positionActionConstants';

export function getValidSwapAction({
  drawDefinition,
  drawPosition,
  structureId,
  structure,
  drawId,

  isByePosition,
  byeDrawPositions,
  positionAssignments,
  tournamentParticipants,

  onlyAssignedPositions = true,
  activeDrawPositions,
  inactiveDrawPositions,
  possiblyDisablingAction,
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
    drawDefinition,
    structure,
    inContext: true,
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
    const participant =
      availableParticipantsMap &&
      availableParticipantsMap[assignment.participantId];

    const sourceDrawPositionRange =
      sourceDrawPositionRangeMap[assignment.drawPosition];

    return {
      ...assignment,
      participant: makeDeepCopy(participant),
      sourceDrawPositionRange,
    };
  });

  if (availableAssignments.length) {
    const validSwapAction = {
      type: SWAP_PARTICIPANTS,
      method: SWAP_PARTICIPANT_METHOD,
      availableAssignments,
      willDisableLinks: possiblyDisablingAction,
      payload: { drawId, structureId, drawPositions: [drawPosition] },
    };
    return { validSwapAction };
  }

  return {};
}
