import { findEventExtension } from '../governors/queryGovernor/extensionQueries';

import { MISSING_EVENT } from '../../constants/errorConditionConstants';
import { FLIGHT_PROFILE } from '../../constants/extensionConstants';

export function getFlightProfile({ event }) {
  if (!event) return { error: MISSING_EVENT };
  const { extension } = findEventExtension({
    event,
    name: FLIGHT_PROFILE,
  });
  const flightProfile = extension?.value;

  event.drawDefinitions?.forEach((drawDefinition) => {
    flightProfile?.flights?.forEach((flight) => {
      if (flight.drawId === drawDefinition.drawId) {
        Object.assign(flight, { drawDefinition });
      }
    });
  });

  return { flightProfile };
}
