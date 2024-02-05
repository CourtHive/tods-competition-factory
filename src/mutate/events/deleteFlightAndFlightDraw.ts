import { addEventExtension } from '@Mutate/extensions/addRemoveExtensions';
import { deleteDrawDefinitions } from '@Mutate/events/deleteDrawDefinitions';
import { refreshEventDrawOrder } from './refreshEventDrawOrder';
import { getFlightProfile } from '@Query/event/getFlightProfile';

// constants
import { MISSING_DRAW_ID, MISSING_EVENT, MISSING_TOURNAMENT_RECORD } from '@Constants/errorConditionConstants';
import { FLIGHT_PROFILE } from '@Constants/extensionConstants';

export function deleteFlightAndFlightDraw({ autoPublish = true, tournamentRecord, auditData, drawId, event, force }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawId) return { error: MISSING_DRAW_ID };
  if (!event) return { error: MISSING_EVENT };

  const { flightProfile } = getFlightProfile({ event });

  if (flightProfile) {
    const flight = flightProfile.flights?.find((flight) => flight.drawId === drawId);

    if (flight) {
      const flights = flightProfile.flights.filter((flight) => {
        return flight.drawId !== drawId;
      });

      const extension = {
        name: FLIGHT_PROFILE,
        value: {
          ...flightProfile,
          flights,
        },
      };

      addEventExtension({ event, extension });
    }
  }

  const drawWasGenerated = event.drawDefinitions?.find((drawDefinition) => drawDefinition.drawId === drawId);
  if (drawWasGenerated) {
    const result = deleteDrawDefinitions({
      drawIds: [drawId],
      eventId: event.eventId,
      tournamentRecord,
      autoPublish,
      auditData,
      event,
      force,
    });
    if (result.error) return result;
  }

  return refreshEventDrawOrder({ tournamentRecord, event });
}
