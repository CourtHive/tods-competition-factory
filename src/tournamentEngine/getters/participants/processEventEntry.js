import { definedAttributes } from '../../../utilities';

export function processEventEntry({
  extensionConversions,
  seedAssignments,
  participant,
  withSeeding,
  seedValue,
  eventId,
  ranking,
  entry,
}) {
  const { entryStatus, entryStage, entryPosition } = entry;

  participant.events[eventId] = definedAttributes(
    {
      ...extensionConversions, // this should be deprecated and clients should use derivedEventInfo
      entryPosition,
      entryStatus,
      entryStage,
      ranking,
      eventId,
    },
    false,
    false,
    true
  );

  if (withSeeding) {
    if (seedAssignments)
      participant.events[eventId].seedAssignments = seedAssignments;
    if (seedValue) participant.events[eventId].seedValue = seedValue;
  }
}
