import { findEventExtension } from '../governors/queryGovernor/extensionQueries';
import { makeDeepCopy } from '../../utilities';

import { MISSING_EVENT } from '../../constants/errorConditionConstants';
import { FLIGHT_PROFILE } from '../../constants/extensionConstants';

export function getFlightProfile({ event }) {
  if (!event) return { error: MISSING_EVENT };
  const { extension } = findEventExtension({
    event,
    name: FLIGHT_PROFILE,
  });
  const flightProfile = makeDeepCopy(extension?.value, false, true);

  event.drawDefinitions?.forEach((drawDefinition) => {
    flightProfile?.flights?.forEach((flight) => {
      if (flight.drawId === drawDefinition.drawId) {
        Object.assign(flight, { drawDefinition });
      }
    });
  });

  return { flightProfile };
}
