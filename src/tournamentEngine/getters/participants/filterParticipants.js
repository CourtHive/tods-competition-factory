import { getAccessorValue } from '../../../utilities/getAccessorValue';
import { getTimeItem } from '../../governors/queryGovernor/timeItems';

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
    eventEntriesOnly,
    participantRoles,
    participantTypes,
    participantIds,
    signInStatus,
  } = participantFilters;

  if (!eventIds?.length && eventEntriesOnly) {
    eventIds = tournamentRecord.events?.map(({ eventId }) => eventId);
  }

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
    return (
      (!participantIds || participantIds.includes(participant.participantId)) &&
      (!signInStatus || participantSignInStatus === signInStatus) &&
      (!participantTypes ||
        (isValidFilterArray(participantTypes) &&
          participantTypes.includes(participant.participantType))) &&
      (!participantRoles ||
        (isValidFilterArray(participantRoles) &&
          participantRoles.includes(participant.participantRole))) &&
      (!accessorValues ||
        (isValidFilterArray(accessorValues) &&
          participantHasAccessorValues(participant)))
    );
  });

  const tournamentEvents =
    (isValidFilterArray(eventIds) &&
      tournamentRecord.events?.filter((event) =>
        eventIds.includes(event.eventId)
      )) ||
    tournamentRecord.events ||
    [];

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
