import { getFlightProfile } from '../getFlightProfile';

import { STRUCTURE_ENTERED_TYPES } from '../../../constants/entryStatusConstants';

export function getStageEntries({
  drawDefinition,
  entryTypes,
  drawId,
  event,
  stage,
}) {
  let entries = event.entries;

  if (drawId) {
    const { flightProfile } = getFlightProfile({ event });
    const flight = flightProfile?.flights?.find(
      (flight) => flight.drawId === drawId
    );
    if (flight) {
      entries = flight.drawEntries;
    } else {
      entries = drawDefinition?.entries;
    }
  }

  const stageEntries = entries.filter(
    (entry) =>
      (!entryTypes ||
        !entry.entryType ||
        entryTypes.includes(entry.entryType)) &&
      (!stage || !entry.entryStage || entry.entryStage === stage) &&
      STRUCTURE_ENTERED_TYPES.includes(entry.entryStatus)
  );
  return { entries, stageEntries };
}
