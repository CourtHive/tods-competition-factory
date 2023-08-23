import { findEventExtension } from '../governors/queryGovernor/extensionQueries';
import { makeDeepCopy } from '../../utilities';

import { MISSING_EVENT } from '../../constants/errorConditionConstants';
import { FLIGHT_PROFILE } from '../../constants/extensionConstants';
import { Event } from '../../types/tournamentFromSchema';

type GetFlightProfileArgs = {
  eventId?: string;
  event: Event;
};
export function getFlightProfile({ event, eventId }: GetFlightProfileArgs) {
  if (!event) return { error: MISSING_EVENT };

  const result = findEventExtension({
    name: FLIGHT_PROFILE,
    event,
  });

  const extension = result?.extension;

  // eventId indicates that `getFlightProfile()` has been called via `tournamentEngine`
  // a deep copy is made and drawDefinitions are attached for client convenience
  const flightProfile = eventId
    ? makeDeepCopy(extension?.value, false, true)
    : extension?.value;

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
