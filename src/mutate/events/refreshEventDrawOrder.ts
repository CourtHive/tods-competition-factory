import { getFlightProfile } from '@Query/event/getFlightProfile';
import { updateDrawIdsOrder } from './updateDrawIdsOrder';

// constants
import { MISSING_EVENT, MISSING_TOURNAMENT_RECORD } from '@Constants/errorConditionConstants';
import { SUCCESS } from '@Constants/resultConstants';

export function refreshEventDrawOrder({ tournamentRecord, event }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const { flightProfile } = getFlightProfile({ event });
  const orderedFlightDrawIds = flightProfile?.flights
    ?.sort((a, b) => a.flightNumber - b.flightNumber)
    .map((f) => f.drawId)
    .filter(Boolean);
  const orderedDrawIds = event.drawDefinitions
    ?.sort((a, b) => a.drawOrder - b.drawOrder)
    .map((d) => d.drawId)
    .filter(Boolean)
    .filter((drawId) => !orderedFlightDrawIds?.includes(drawId));

  const orderedDrawIdsMap = Object.assign(
    {},
    ...[...(orderedFlightDrawIds || []), ...(orderedDrawIds || [])].map((drawId, i) => ({ [drawId]: i + 1 })),
  );

  return orderedDrawIdsMap ? updateDrawIdsOrder({ event, orderedDrawIdsMap }) : { ...SUCCESS };
}
