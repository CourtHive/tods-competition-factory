import { findEventExtension } from '../governors/queryGovernor/extensionQueries';

import { MISSING_EVENT } from '../../constants/errorConditionConstants';

export function getFlightProfile({ event }) {
  if (!event) return { error: MISSING_EVENT };
  const { extension } = findEventExtension({
    event,
    name: 'flightProfile',
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
