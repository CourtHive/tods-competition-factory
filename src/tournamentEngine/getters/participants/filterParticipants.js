import { getAllPositionedParticipantIds } from '../../../drawEngine/getters/positionsGetter';
import { getAccessorValue } from '../../../utilities/getAccessorValue';
import { getTimeItem } from '../../governors/queryGovernor/timeItems';
import { getFlightProfile } from '../getFlightProfile';
import { unique } from '../../../utilities';

import { SIGN_IN_STATUS } from '../../../constants/participantConstants';
import { SINGLES } from '../../../constants/eventConstants';

export function filterParticipants({
  tournamentRecord,
  participantFilters,
  participants,
}) {
  let { eventIds } = participantFilters;
  const {
    accessorValues,
    drawEntryStatuses, // {string[]} participantIds that are in draw.entries or flightProfile.flights[].drawEnteredParticipantIds with entryStatuses
    positionedParticipants, // boolean - participantIds that are included in any structure.positionAssignments
    eventEntryStatuses, // {string[]} participantIds that are in entry.entries with entryStatuses
    participantRoles,
    participantRoleResponsibilities,
    participantTypes,
    participantIds,
    signInStatus,
    enableOrFiltering,
  } = participantFilters;

  const tournamentEvents =
    (isValidFilterArray(eventIds) &&
      tournamentRecord.events?.filter((event) =>
        eventIds.includes(event.eventId)
      )) ||
    tournamentRecord.events ||
    [];

  const drawEnteredParticipantIds =
    drawEntryStatuses &&
    getDrawEntries({ drawEntryStatuses, tournamentEvents });

  const eventEnteredParticipantIds =
    eventEntryStatuses &&
    getEventEntries({ eventEntryStatuses, tournamentEvents });

  const positionedParticipantIds =
    [true, false].includes(positionedParticipants) &&
    tournamentEvents.reduce((participantIds, event) => {
      return participantIds.concat(
        ...(event.drawDefinitions || [])
          .map((drawDefinition) =>
            getAllPositionedParticipantIds({ drawDefinition })
          )
          .filter(Boolean)
      );
    }, []);

  const participantHasAccessorValues = (participant) => {
    return accessorValues.reduce((hasValues, keyValue) => {
      const { accessor, value } = keyValue;
      const { values } = getAccessorValue({
        element: participant,
        accessor,
      });
      return hasValues && values?.includes(value);
    }, true);
  };

  participants = participants?.filter((participant) => {
    const participantSignInStatus = getTimeItem({
      element: participant,
      itemType: SIGN_IN_STATUS,
    });
    const {
      participantId,
      participantType,
      participantRole,
      participantRoleResponsibilities: responsibilities,
    } = participant;

    if (enableOrFiltering) {
      return (
        (positionedParticipants &&
          positionedParticipantIds.includes(participantId)) ||
        (positionedParticipants === false &&
          !positionedParticipantIds.includes(participantId)) ||
        (drawEnteredParticipantIds &&
          drawEnteredParticipantIds.includes(participantId)) ||
        (eventEnteredParticipantIds &&
          eventEnteredParticipantIds.includes(participantId)) ||
        (participantIds && participantIds.includes(participantId)) ||
        (signInStatus && participantSignInStatus === signInStatus) ||
        (participantTypes &&
          isValidFilterArray(participantTypes) &&
          participantTypes.includes(participantType)) ||
        (participantRoles &&
          isValidFilterArray(participantRoles) &&
          participantRoles.includes(participantRole)) ||
        (participantRoleResponsibilities &&
          isValidFilterArray(responsibilities) &&
          isValidFilterArray(participantRoleResponsibilities) &&
          participantRoleResponsibilities.find((roleResponsbility) =>
            responsibilities.includes(roleResponsbility)
          )) ||
        (accessorValues?.length &&
          isValidFilterArray(accessorValues) &&
          participantHasAccessorValues(participant))
      );
    } else {
      return (
        (positionedParticipants === undefined ||
          (positionedParticipants &&
            positionedParticipantIds.includes(participantId)) ||
          (positionedParticipants === false &&
            !positionedParticipantIds.includes(participantId))) &&
        (!drawEnteredParticipantIds ||
          drawEnteredParticipantIds.includes(participantId)) &&
        (!eventEnteredParticipantIds ||
          eventEnteredParticipantIds.includes(participantId)) &&
        (!participantIds || participantIds.includes(participantId)) &&
        (!signInStatus || participantSignInStatus === signInStatus) &&
        (!participantTypes ||
          (isValidFilterArray(participantTypes) &&
            participantTypes.includes(participantType))) &&
        (!participantRoles ||
          (isValidFilterArray(participantRoles) &&
            participantRoles.includes(participantRole))) &&
        (!participantRoleResponsibilities ||
          (isValidFilterArray(responsibilities) &&
            isValidFilterArray(participantRoleResponsibilities) &&
            participantRoleResponsibilities.find((roleResponsbility) =>
              responsibilities.includes(roleResponsbility)
            ))) &&
        (!accessorValues?.length ||
          (isValidFilterArray(accessorValues) &&
            participantHasAccessorValues(participant)))
      );
    }
  });

  if (tournamentEvents.length && eventIds) {
    const participantIds = tournamentEvents
      .filter((event) => eventIds.includes(event.eventId))
      .map((event) => {
        const enteredParticipantIds = event.entries.map(
          (entry) => entry.participantId
        );
        if (event.eventType === SINGLES) return enteredParticipantIds;
        const individualParticipantIds = (tournamentRecord.participants || [])
          .filter((participant) =>
            enteredParticipantIds.includes(participant.participantId)
          )
          .map((participant) => participant.individualParticipantIds)
          .flat(1);
        return enteredParticipantIds.concat(...individualParticipantIds);
      })
      .flat(1);
    participants = participants?.filter((participant) =>
      participantIds.includes(participant.participantId)
    );
  }

  return participants;
}

function isValidFilterArray(filter) {
  return filter && Array.isArray(filter) && filter.length;
}

function getDrawEntries({ drawEntryStatuses, tournamentEvents }) {
  const statusFilter = ({ entryStatus }) =>
    !Array.isArray(drawEntryStatuses)
      ? true
      : drawEntryStatuses.includes(entryStatus);

  return unique(
    tournamentEvents.reduce((entries, event) => {
      const { flightProfile } = getFlightProfile({ event });
      const flightEntries =
        flightProfile?.flights
          ?.map(({ drawEntries }) =>
            Array.isArray(drawEntries)
              ? drawEntries
                  .filter(statusFilter)
                  .map(({ participantId }) => participantId)
              : []
          )
          .flat() || [];

      const drawEnteredParticipantIds =
        event.drawDefinitions?.map(({ entries }) =>
          entries
            ? entries
                .filter(statusFilter)
                .map(({ participantId }) => participantId)
            : []
        ) || [];

      return entries.concat(...flightEntries, ...drawEnteredParticipantIds);
    }, [])
  );
}

function getEventEntries({ eventEntryStatuses, tournamentEvents }) {
  return unique(
    tournamentEvents.reduce((entries, event) => {
      const eventEntries = event.entries
        .filter(({ entryStatus }) =>
          !Array.isArray(eventEntryStatuses)
            ? true
            : eventEntryStatuses.includes(entryStatus)
        )
        .map(({ participantId }) => participantId);

      return entries.concat(...eventEntries);
    }, [])
  );
}
