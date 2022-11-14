import { definedAttributes, intersection } from '../../../utilities';
import { getEventSeedAssignments } from './getEventSeedAssignments';

import { SCALE, SEEDING } from '../../../constants/scaleConstants';

export function processEventEntry({
  extensionConversions,
  publishedSeeding,
  usePublishState,
  participantMap,
  withSeeding,
  ranking,
  entry,
  event,
}) {
  const { entryStatus, entryStage, participantId, entryPosition } = entry;
  const { eventType, eventId } = event;

  participantMap[participantId].events[eventId] = definedAttributes(
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
    const getScaleAccessor = (scaleName) =>
      [SCALE, SEEDING, eventType, scaleName].join('.');

    const participant = participantMap[participantId].participant;
    const seedingScales = Object.assign(
      {},
      ...(participant.timeItems || [])
        .filter(({ itemType }) => itemType.split('.')[1] === SEEDING)
        .map(({ itemType: seedingScaleName, itemValue: seedValue }) => ({
          [seedingScaleName]: seedValue,
        }))
    );
    const eventSeedingScaleNames = (
      (publishedSeeding?.stageSeedingScaleNames &&
        Object.values(publishedSeeding?.stageSeedingScaleNames)) ||
      (Array.isArray(publishedSeeding?.seedingScaleNames) &&
        publishedSeeding.seedingScaleNames) ||
      []
    ).map(getScaleAccessor);
    const publishedEventSeedingScaleNames = intersection(
      Object.keys(seedingScales),
      eventSeedingScaleNames
    );
    const eventSeedingPublished = !!(
      !usePublishState ||
      (!Object.keys(seedingScales).length &&
        !publishedSeeding?.drawIds?.length) ||
      publishedEventSeedingScaleNames.length
    );

    const { seedAssignments, seedValue } = getEventSeedAssignments({
      publishedEventSeedingScaleNames,
      eventSeedingPublished,
      publishedSeeding,
      usePublishState,
      seedingScales,
      withSeeding,
      participant,
      event,
    });

    if (seedAssignments)
      participantMap[participantId].events[eventId].seedAssignments =
        seedAssignments;
    if (seedValue)
      participantMap[participantId].events[eventId].seedAssignments = seedValue;
  }
}
