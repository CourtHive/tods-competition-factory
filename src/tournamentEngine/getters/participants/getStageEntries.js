import { getFlightProfile } from '../getFlightProfile';

import { STRUCTURE_SELECTED_STATUSES } from '../../../constants/entryStatusConstants';

export function getStageEntries({
  selected = true,
  drawDefinition,
  entryStatuses,
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
      (!entryStatuses?.length ||
        !entry.entryStatus ||
        entryStatuses.includes(entry.entryStatus)) &&
      (!stage || !entry.entryStage || entry.entryStage === stage) &&
      (!selected || STRUCTURE_SELECTED_STATUSES.includes(entry.entryStatus))
  );
  return { entries, stageEntries };
}
