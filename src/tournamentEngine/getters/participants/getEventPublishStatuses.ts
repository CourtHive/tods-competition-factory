import { getEventPublishStatus } from '../../../query/event/getEventPublishStatus';
import { getDrawPublishStatus } from '../../../query/event/getDrawPublishStatus';

export function getEventPublishStatuses({ event }) {
  const eventPubStatus = getEventPublishStatus({ event });

  if (eventPubStatus) {
    const publishedSeeding = {
      published: undefined, // seeding can be present for all entries in an event when no flights have been defined
      seedingScaleNames: [],
      drawIds: [], // seeding can be specific to drawIds
    };

    if (eventPubStatus.seeding) {
      Object.assign(publishedSeeding, eventPubStatus.seeding);
    }

    const { drawDetails, drawIds } = eventPubStatus;

    const publishedDrawIds =
      (drawDetails &&
        Object.keys(drawDetails).filter((drawId) =>
          getDrawPublishStatus({ drawDetails, drawId })
        )) ||
      drawIds ||
      [];

    return {
      publishedDrawIds,
      publishedSeeding,
    };
  }

  return undefined;
}
