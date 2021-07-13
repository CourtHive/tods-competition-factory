import { addEventExtension } from '../../tournamentGovernor/addRemoveExtensions';
import { getFlightProfile } from '../../../getters/getFlightProfile';
import { deleteDrawDefinitions } from './deleteDrawDefinitions';

import {
  MISSING_DRAW_ID,
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';
import { FLIGHT_PROFILE } from '../../../../constants/extensionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

export function deleteFlightAndFlightDraw({ tournamentRecord, event, drawId }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawId) return { error: MISSING_DRAW_ID };
  if (!event) return { error: MISSING_EVENT };

  const { flightProfile } = getFlightProfile({ event });

  if (flightProfile) {
    const flight = flightProfile.flights?.find(
      (flight) => flight.drawId === drawId
    );

    if (flight) {
      const flights = flightProfile.flights.filter(
        (flight) => flight.drawId !== drawId
      );

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

  deleteDrawDefinitions({
    tournamentRecord,
    eventId: event.eventId,
    drawIds: [drawId],
  });

  return SUCCESS;
}
