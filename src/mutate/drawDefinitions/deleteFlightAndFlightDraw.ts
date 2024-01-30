import { addEventExtension } from '../extensions/addRemoveExtensions';
import { getFlightProfile } from '../../query/event/getFlightProfile';
import { refreshEventDrawOrder } from './refreshEventDrawOrder';
import { deleteDrawDefinitions } from '../events/deleteDrawDefinitions';

import { FLIGHT_PROFILE } from '@Constants/extensionConstants';
import { MISSING_DRAW_ID, MISSING_EVENT, MISSING_TOURNAMENT_RECORD } from '@Constants/errorConditionConstants';

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
