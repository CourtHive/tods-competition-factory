import {
  CONSOLATION,
  MAIN,
} from '../../../../constants/drawDefinitionConstants';
import { MISSING_DRAW_ID } from '../../../../constants/errorConditionConstants';
import {
  LUCKY_PARTICIPANT,
  LUCKY_PARTICIPANT_METHOD,
} from '../../../../constants/positionActionConstants';

export function getValidLuckyLosersAction({
  drawPosition,
  structureId,
  drawId,

  structure,
  drawDefinition,
  activeDrawPositions,
  positionAssignments,
  tournamentParticipants = [],
}) {
  if (!drawId)
    return { error: MISSING_DRAW_ID, method: 'getValidLuckyLosersAction' };
  if (activeDrawPositions.includes(drawPosition)) return {};

  const assignedParticipantIds = positionAssignments
    .map((assignment) => assignment.participantId)
    .filter((f) => f);

  /*
  Available Lucky Losers are those participants who are assigned drawPositions
  in previous draw structures and have already lost
  */

  // WIP: logic beyond this is in development
  if (drawDefinition) return {};

  const availableLuckyLoserParticipantIds = drawDefinition.entries
    ?.filter(
      (entry) =>
        eligibleEntryStage({ structure, entry }) &&
        !assignedParticipantIds.includes(entry.participantId)
    )
    .sort((a, b) => (a.entryPosition || 0) - (b.entryPosition || 0))
    .map((entry) => entry.participantId);

  const availableLuckyLosers = tournamentParticipants?.filter((participant) =>
    availableLuckyLoserParticipantIds.includes(participant.participantId)
  );
  availableLuckyLosers.forEach((alternate) => {
    const entry = (drawDefinition.entries || []).find(
      (entry) => entry.participantId === alternate.participantId
    );
    alternate.entryPosition = entry?.entryPosition;
  });

  if (availableLuckyLoserParticipantIds.length) {
    const validAlternatesAction = {
      type: LUCKY_PARTICIPANT,
      method: LUCKY_PARTICIPANT_METHOD,
      availableLuckyLosers,
      availableLuckyLoserParticipantIds,
      payload: { drawId, structureId, drawPosition },
    };
    return { validAlternatesAction };
  }

  return {};
}

function eligibleEntryStage({ structure, entry }) {
  const { stage } = structure;
  if (
    entry.entryStage === stage ||
    (entry.entryStage === MAIN && stage === CONSOLATION)
  )
    return true;
}
