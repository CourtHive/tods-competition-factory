import { makeDeepCopy } from '@Tools/makeDeepCopy';
import { findExtension } from '../../acquire/findExtension';

import { MISSING_EVENT } from '@Constants/errorConditionConstants';
import { FLIGHT_PROFILE } from '@Constants/extensionConstants';
import { Event } from '@Types/tournamentTypes';

type GetFlightProfileArgs = {
  eventId?: string;
  event: Event;
};
export function getFlightProfile({ event, eventId }: GetFlightProfileArgs) {
  if (!event) return { error: MISSING_EVENT };

  const result = findExtension({
    name: FLIGHT_PROFILE,
    element: event,
  });

  const extension = result?.extension;

  // eventId indicates that `getFlightProfile()` has been called via `tournamentEngine`
  // a deep copy is made and drawDefinitions are attached for client convenience
  const flightProfile = eventId ? makeDeepCopy(extension?.value, false, true) : extension?.value;

  if (eventId) {
    event.drawDefinitions?.forEach((drawDefinition) => {
      flightProfile?.flights?.forEach((flight) => {
        if (flight.drawId === drawDefinition.drawId) {
          Object.assign(flight, { drawDefinition });
        }
      });
    });
  }

  return { flightProfile };
}
