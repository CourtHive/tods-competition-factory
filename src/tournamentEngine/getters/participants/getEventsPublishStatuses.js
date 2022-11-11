import { getTimeItem } from '../../governors/queryGovernor/timeItems';

import { PUBLISH, STATUS } from '../../../constants/timeItemConstants';

export function getEventsPublishStatuses({ event }) {
  const itemType = `${PUBLISH}.${STATUS}`;

  const { timeItem } = getTimeItem({
    element: event,
    itemType,
  });

  if (timeItem?.itemValue?.PUBLIC) {
    const { drawIds: publishedDrawIds = [], seeding } =
      timeItem.itemValue.PUBLIC || {};

    const publishedSeeding = {
      published: undefined, // seeding can be present for all entries in an event when no flights have been defined
      seedingScaleNames: [],
      drawIds: [], // seeding can be specific to drawIds
    };

    if (seeding)
      Object.assign(publishedSeeding, timeItem.itemValue.PUBLIC.seeding);

    return {
      publishedDrawIds,
      publishedSeeding,
    };
  }
}
