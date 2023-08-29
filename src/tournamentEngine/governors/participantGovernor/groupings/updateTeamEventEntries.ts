import { getFlightProfile } from '../../../getters/getFlightProfile';

import { SUCCESS } from '../../../../constants/resultConstants';
import { TEAM } from '../../../../constants/eventConstants';

/**
 * function called internally to cleanup event entries when individuals have been added to team events
 */
export function updateTeamEventEntries({
  individualParticipantIds,
  groupingParticipantId,
  tournamentRecord,
}) {
  const relevantEvents = (tournamentRecord.events || []).filter(
    (event) =>
      event?.eventType === TEAM &&
      event?.entries?.some(
        (entry) => entry.participantId === groupingParticipantId
      )
  );

  const filterEntry = (entry) =>
    !individualParticipantIds.includes(entry.participantId);

  for (const event of relevantEvents) {
    event.entries = (event.entries || []).filter(filterEntry);

    const { flightProfile } = getFlightProfile({ event });
    flightProfile?.flights?.forEach((flight) => {
      flight.drawEntries = (flight.drawEntries || []).filter(filterEntry);
    });

    event?.drawDefinitions?.forEach((drawDefinition) => {
      drawDefinition.entries = (drawDefinition.entries || []).filter(
        filterEntry
      );
    });
  }

  return { ...SUCCESS };
}
