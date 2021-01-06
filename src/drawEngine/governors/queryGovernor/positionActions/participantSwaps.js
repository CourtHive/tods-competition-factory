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

  positionAssignments,
  tournamentParticipants,

  activeDrawPositions,
  inactiveDrawPositions,
}) {
  if (!drawId) return { error: MISSING_DRAW_ID, method: 'getValidSwapAction' };
  if (activeDrawPositions.includes(drawPosition)) return {};

  const availableDrawPositions = inactiveDrawPositions?.filter(
    (position) => position !== drawPosition
  );
  const filteredAssignments = positionAssignments.filter((assignment) =>
    availableDrawPositions?.includes(assignment.drawPosition)
  );
  const availableParticipantIds = filteredAssignments
    .map((assignment) => assignment.participantId)
    .filter((f) => f);
  const participantsAvailable = Object.assign(
    {},
    ...tournamentParticipants
      ?.filter((participant) =>
        availableParticipantIds.includes(participant.participantId)
      )
      .map((participant) => ({ [participant.participantId]: participant }))
  );
  const availableAssignments = filteredAssignments.map((assignment) => {
    const participant =
      participantsAvailable && participantsAvailable[assignment.participantId];
    return Object.assign({}, assignment, {
      participant: makeDeepCopy(participant),
    });
  });

  if (inactiveDrawPositions) {
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
