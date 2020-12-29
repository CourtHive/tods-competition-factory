import { ALTERNATE } from '../../../../constants/entryStatusConstants';
import { MISSING_DRAW_ID } from '../../../../constants/errorConditionConstants';
import {
  ALTERNATE_PARTICIPANT,
  ALTERNATE_PARTICIPANT_METHOD,
} from '../../../../constants/positionActionConstants';

export function getValidAlternatesAction({
  drawPosition,
  structureId,
  drawId,

  structure,
  drawDefinition,
  positionAssignments,
  tournamentParticipants,
}) {
  if (!drawId) return { error: MISSING_DRAW_ID };

  const { stage } = structure;
  const assignedParticipantIds = positionAssignments
    .map((assignment) => assignment.participantId)
    .filter((f) => f);
  const availableAlternatesParticipantIds = drawDefinition.entries
    ?.filter(
      (entry) =>
        entry.entryStage === stage &&
        entry.entryStatus === ALTERNATE &&
        !assignedParticipantIds.includes(entry.participantId)
    )
    .map((entry) => entry.participantId);

  const availableAlternates = tournamentParticipants.filter((participant) =>
    availableAlternatesParticipantIds.includes(participant.participantId)
  );

  if (availableAlternatesParticipantIds.length) {
    const validAlternatesAction = {
      type: ALTERNATE_PARTICIPANT,
      method: ALTERNATE_PARTICIPANT_METHOD,
      availableAlternates,
      availableAlternatesParticipantIds,
      payload: { drawId, structureId, drawPosition },
    };
    return { validAlternatesAction };
  }

  return {};
}
