import { participantScaleItem } from '../../accessors/participantScaleItem';

import { SCALE, SEEDING } from '../../../constants/scaleConstants';

export function getEventSeedAssignments({
  publishedEventSeedingScaleNames,
  eventSeedingPublished,
  publishedSeeding,
  usePublishState,
  seedingScales,
  withSeeding,
  participant,
  event,
}) {
  const eventSeedAssignments = {};

  const getScaleAccessor = (scaleName) =>
    [SCALE, SEEDING, event.eventType, scaleName].join('.');

  if (eventSeedingPublished && publishedEventSeedingScaleNames.length) {
    if (publishedSeeding?.stageSeedingScaleNames) {
      const scaleValues = Object.keys(publishedSeeding.stageSeedingScaleNames)
        .map((key) => {
          const accessor = getScaleAccessor(
            publishedSeeding.stageSeedingScaleNames[key]
          );
          const scaleValue = seedingScales[accessor];
          return [key, scaleValue];
        })
        .filter((pair) => pair[1])
        .map((pair) => ({ [pair[0]]: { seedValue: pair[1] } }));
      const seedAssignments = Object.assign({}, ...scaleValues);

      eventSeedAssignments.seedAssignments = seedAssignments;
    } else if (publishedEventSeedingScaleNames) {
      const seedValues = publishedEventSeedingScaleNames.map(
        (scaleName) => seedingScales[scaleName]
      );
      eventSeedAssignments.seedValue = seedValues.pop();
    }
  } else if (!usePublishState && typeof withSeeding === 'object') {
    const scaleValues = Object.keys(withSeeding)
      .map((key) => {
        const accessor = getScaleAccessor(withSeeding[key]);
        const scaleValue = seedingScales[accessor];
        return [key, scaleValue];
      })
      .filter((pair) => pair[1])
      .map((pair) => ({ [pair[0]]: { seedValue: pair[1] } }));
    const seedAssignments = Object.assign({}, ...scaleValues);

    eventSeedAssignments.seedAssignments = seedAssignments;
  } else {
    const { categoryName, ageCategoryCode } = event.category || {};

    let scaleItem;
    for (const scaleName of [ageCategoryCode, event.eventId, categoryName]) {
      const scaleAttributes = {
        eventType: event.eventType,
        scaleType: SEEDING,
        scaleName,
      };
      const result = participantScaleItem({
        scaleAttributes,
        participant,
      });
      if (result.scaleItem) {
        scaleItem = result.scaleItem;
        break;
      }
    }

    if (scaleItem) {
      const seedValue = scaleItem.scaleValue;
      console.log({ seedValue });
      /*
      const seedingPublished =
        !usePublishState ||
        (publishedSeeding?.published &&
          (publishedSeeding?.drawIds?.length === 0 ||
            publishedSeeding?.drawIds?.includes(drawId)));

      if (seedingPublished) {
        eventSeedAssignments.seedValue = seedValue;
      }
      */
    }
  }

  return eventSeedAssignments;
}
