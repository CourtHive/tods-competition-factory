import { getFlightProfile } from '../../../../tournamentEngine/getters/getFlightProfile';
import { definedAttributes } from '../../../../utilities/objects';
import { unique } from '../../../../utilities';

import { POLICY_TYPE_POSITION_ACTIONS } from '../../../../constants/policyConstants';
import {
  CONSOLATION,
  MAIN,
} from '../../../../constants/drawDefinitionConstants';
import {
  ALTERNATE_PARTICIPANT,
  ALTERNATE_PARTICIPANT_METHOD,
} from '../../../../constants/positionActionConstants';
import {
  ALTERNATE,
  UNGROUPED,
  UNPAIRED,
  WITHDRAWN,
} from '../../../../constants/entryStatusConstants';

export function getValidAlternatesAction({
  tournamentParticipants = [],
  possiblyDisablingAction,
  activeDrawPositions,
  positionAssignments,
  returnParticipants,
  appliedPolicies,
  drawDefinition,
  drawPosition,
  structureId,
  structure,
  drawId,
  event,
}) {
  if (activeDrawPositions.includes(drawPosition)) return {};

  const otherFlightEntries =
    appliedPolicies?.[POLICY_TYPE_POSITION_ACTIONS]?.otherFlightEntries;

  const drawEnteredParticpantIds = (drawDefinition.entries || [])
    .sort((a, b) => (a.entryPosition || 9999) - (b.entryPosition || 9999))
    .map(({ participantId }) => participantId)
    .filter(Boolean);

  const assignedParticipantIds = positionAssignments
    .map((assignment) => assignment.participantId)
    .filter(Boolean);

  const availableDrawEnteredParticipantIds = drawEnteredParticpantIds.filter(
    (participantId) => !assignedParticipantIds.includes(participantId)
  );

  const eventEntries = event.entries || [];
  const availableEventAlternatesParticipantIds = eventEntries
    .filter(
      (entry) =>
        entry.entryStatus === ALTERNATE &&
        eligibleEntryStage({ structure, entry }) &&
        !assignedParticipantIds.includes(entry.participantId)
    )
    .sort((a, b) => (a.entryPosition || 9999) - (b.entryPosition || 9999))
    .map((entry) => entry.participantId);

  const availableAlternatesParticipantIds = unique(
    availableDrawEnteredParticipantIds.concat(
      availableEventAlternatesParticipantIds
    )
  );

  if (otherFlightEntries) {
    const { flightProfile } = getFlightProfile({ event });
    const otherFlightEnteredParticipantIds = flightProfile?.flights
      ?.filter((flight) => flight.drawId !== drawId)
      .map((flight) =>
        flight.drawEntries
          .filter(
            (entry) =>
              entry.participantId &&
              ![WITHDRAWN, UNGROUPED, UNPAIRED].includes(entry.entryStatus) &&
              !drawEnteredParticpantIds.includes(entry.participantId)
          )
          .map(({ participantId }) => participantId)
      )
      .flat()
      .filter(Boolean);

    if (otherFlightEnteredParticipantIds?.length) {
      // include direct acceptance participants from other flights
      availableAlternatesParticipantIds.push(
        ...otherFlightEnteredParticipantIds
      );
    }
  }
  const availableAlternates = returnParticipants
    ? tournamentParticipants?.filter((participant) =>
        availableAlternatesParticipantIds.includes(participant.participantId)
      )
    : undefined;
  availableAlternates?.forEach((alternate) => {
    const entry = (drawDefinition.entries || []).find(
      (entry) => entry.participantId === alternate.participantId
    );
    alternate.entryPosition = entry?.entryPosition;
  });
  availableAlternates?.sort(
    (a, b) => (a.entryPosition || 9999) - (b.entryPosition || 9999)
  );

  if (availableAlternatesParticipantIds.length) {
    const validAlternatesAction = definedAttributes({
      payload: { drawId, structureId, drawPosition },
      willDisableLinks: possiblyDisablingAction,
      method: ALTERNATE_PARTICIPANT_METHOD,
      availableAlternatesParticipantIds,
      type: ALTERNATE_PARTICIPANT,
      availableAlternates,
    });
    return { validAlternatesAction };
  }

  return {};
}

export function eligibleEntryStage({ structure, entry }) {
  const { stage } = structure;
  if (
    !entry.entryStage ||
    entry.entryStage === stage ||
    (entry.entryStage === MAIN && stage === CONSOLATION)
  )
    return true;
}
