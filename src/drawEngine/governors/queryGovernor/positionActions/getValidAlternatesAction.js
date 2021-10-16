import { POLICY_TYPE_POSITION_ACTIONS } from '../../../../constants/policyConstants';
import { ALTERNATE } from '../../../../constants/entryStatusConstants';
import {
  CONSOLATION,
  MAIN,
} from '../../../../constants/drawDefinitionConstants';
import {
  ALTERNATE_PARTICIPANT,
  ALTERNATE_PARTICIPANT_METHOD,
} from '../../../../constants/positionActionConstants';

export function getValidAlternatesAction({
  tournamentParticipants = [],
  possiblyDisablingAction,
  activeDrawPositions,
  positionAssignments,
  policyDefinitions,
  drawDefinition,
  drawPosition,
  structureId,
  structure,
  drawId,
  event,
}) {
  if (activeDrawPositions.includes(drawPosition)) return {};
  const expandedFlightAlternates =
    policyDefinitions?.[POLICY_TYPE_POSITION_ACTIONS]?.expandedFlightAlternates;

  const assignedParticipantIds = positionAssignments
    .map((assignment) => assignment.participantId)
    .filter(Boolean);
  const eventEntries = event.entries || [];
  const availableAlternatesParticipantIds = eventEntries
    .filter(
      (entry) =>
        entry.entryStatus === ALTERNATE &&
        eligibleEntryStage({ structure, entry }) &&
        !assignedParticipantIds.includes(entry.participantId)
    )
    .sort((a, b) => (a.entryPosition || 0) - (b.entryPosition || 0))
    .map((entry) => entry.participantId);

  if (expandedFlightAlternates) {
    // include direct acceptance participants from other flights
  }
  const availableAlternates = tournamentParticipants?.filter((participant) =>
    availableAlternatesParticipantIds.includes(participant.participantId)
  );
  availableAlternates.forEach((alternate) => {
    const entry = (drawDefinition.entries || []).find(
      (entry) => entry.participantId === alternate.participantId
    );
    alternate.entryPosition = entry?.entryPosition;
  });
  availableAlternates.sort(
    (a, b) => (a.entryPosition || 0) - (b.entryPosition || 0)
  );

  if (availableAlternatesParticipantIds.length) {
    const validAlternatesAction = {
      type: ALTERNATE_PARTICIPANT,
      method: ALTERNATE_PARTICIPANT_METHOD,
      availableAlternates,
      availableAlternatesParticipantIds,
      willDisableLinks: possiblyDisablingAction,
      payload: { drawId, structureId, drawPosition },
    };
    return { validAlternatesAction };
  }

  return {};
}

function eligibleEntryStage({ structure, entry }) {
  const { stage } = structure;
  if (
    !entry.entryStage ||
    entry.entryStage === stage ||
    (entry.entryStage === MAIN && stage === CONSOLATION)
  )
    return true;
}
