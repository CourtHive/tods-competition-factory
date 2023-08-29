import { getFlightProfile } from '../../../getters/getFlightProfile';
import { updateDrawIdsOrder } from './updateDrawIdsOrder';

import { SUCCESS } from '../../../../constants/resultConstants';
import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';

export function refreshEventDrawOrder({ tournamentRecord, event }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const { flightProfile } = getFlightProfile({ event });

  // if there is a flightProfile, derive order from that, otherwise use drawDefinitions array
  const orderedDrawIdsMap =
    (flightProfile?.flights &&
      Object.assign(
        {},
        ...flightProfile.flights
          .sort((a, b) => a.flightNumber - b.flightNumber)
          .map((flight, i) => ({ [flight.drawId]: i + 1 }))
      )) ||
    (event.drawDefinitions?.length &&
      Object.assign(
        {},
        ...event.drawDefinitions
          .sort((a, b) => a.drawOrder - b.drawOrder)
          .map((drawDefinition, i) => ({ [drawDefinition.drawId]: i + 1 }))
      )) ||
    undefined;

  return orderedDrawIdsMap
    ? updateDrawIdsOrder({ event, orderedDrawIdsMap })
    : { ...SUCCESS };
}
