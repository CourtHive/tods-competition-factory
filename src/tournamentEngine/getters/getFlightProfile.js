import { findEventExtension } from '../governors/queryGovernor/extensionQueries';

import { MISSING_EVENT } from '../../constants/errorConditionConstants';

export function getFlightProfile({ event }) {
  if (!event) return { error: MISSING_EVENT };
  const { extension: flightProfile } = findEventExtension({
    event,
    name: 'flightProfile',
  });
  const flights = flightProfile?.value;

  event.drawDefinitions?.forEach((drawDefinition) => {
    const flight = flights.find(
      ({ drawId }) => drawDefinition.drawId === drawId
    );
    if (flight) flight.drawDefinition = drawDefinition;
  });

  return { flights };
}
