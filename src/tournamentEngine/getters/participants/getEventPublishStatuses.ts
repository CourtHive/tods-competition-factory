import { getTimeItem } from '../../governors/queryGovernor/timeItems';

import { PUBLIC, PUBLISH, STATUS } from '../../../constants/timeItemConstants';

export function getEventPublishStatuses({ event }) {
  const itemType = `${PUBLISH}.${STATUS}`;

  const eventPubState = getTimeItem({
    element: event,
    itemType,
  })?.timeItem?.itemValue?.[PUBLIC];

  if (eventPubState) {
    const publishedSeeding = {
      published: undefined, // seeding can be present for all entries in an event when no flights have been defined
      seedingScaleNames: [],
      drawIds: [], // seeding can be specific to drawIds
    };

    if (eventPubState.seeding) {
      Object.assign(publishedSeeding, eventPubState.seeding);
    }

    const publishedDrawIds =
      (eventPubState.drawDetails && Object.keys(eventPubState.drawDetails)) ??
      eventPubState.drawIds ??
      [];

    return {
      publishedDrawIds,
      publishedSeeding,
    };
  }

  return undefined;
}
