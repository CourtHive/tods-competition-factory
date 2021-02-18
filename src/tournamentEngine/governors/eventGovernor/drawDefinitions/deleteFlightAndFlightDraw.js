import { addEventExtension } from '../../tournamentGovernor/addRemoveExtensions';
import { getFlightProfile } from '../../../getters/getFlightProfile';
import { deleteDrawDefinitions } from './deleteDrawDefinitions';

import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';
import { FLIGHT_PROFILE } from '../../../../constants/flightConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

export function deleteFlightAndFlightDraw({ tournamentRecord, event, drawId }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const { flightProfile } = getFlightProfile({ event });

  if (flightProfile) {
    const flight = flightProfile.flights?.find(
      (flight) => flight.drawId === drawId
    );

    if (flight) {
      deleteDrawDefinitions({
        tournamentRecord,
        eventId: event.eventId,
        drawIds: [drawId],
      });

      const flights = flightProfile.flights.filter(
        (flight) => flight.drawId !== drawId
      );

      const extension = {
        name: FLIGHT_PROFILE,
        value: {
          flights,
        },
      };

      addEventExtension({ event, extension });
    }
  }

  return SUCCESS;
}
