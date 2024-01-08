import { getEventPublishStatus } from '../event/getEventPublishStatus';
import { getDrawPublishStatus } from '../event/getDrawPublishStatus';

import { ResultType } from '../../global/functions/decorateResult';
import { Event, Tournament } from '../../types/tournamentTypes';
import { SUCCESS } from '../../constants/resultConstants';
import { isString } from '../../utilities/objects';
import { findEvent } from '../../acquire/findEvent';
import { EVENT_NOT_FOUND, INVALID_VALUES } from '../../constants/errorConditionConstants';

type GetPublishStateArgs = {
  tournamentRecord?: Tournament;
  eventIds?: string[];
  drawIds?: string[];
  drawId?: string;
  event: Event;
};

export function getPublishState({
  tournamentRecord,
  eventIds,
  drawIds,
  drawId,
  event,
}: GetPublishStateArgs): ResultType & {
  publishState?: any;
} {
  if (Array.isArray(eventIds) && eventIds?.length) {
    const publishState: any = {};
    for (const eventId of eventIds) {
      if (!isString(eventId)) return { error: INVALID_VALUES };
      const event = findEvent({ tournamentRecord, eventId });
      if (!event) return { error: EVENT_NOT_FOUND };
      const pubStatus: any = getPubStatus({ event });
      if (pubStatus.error) return pubStatus;
      publishState[eventId] = pubStatus;
    }
    return { ...SUCCESS, publishState };
  } else if (!event && tournamentRecord?.events && Array.isArray(drawIds) && drawIds.length) {
    const publishState: any = {};
    for (const event of tournamentRecord.events) {
      const pubStatus: any = getPubStatus({ event });
      if (pubStatus.error) return pubStatus;
      for (const drawId of drawIds) {
        if (!isString(drawId)) return { error: INVALID_VALUES };
        const published = pubStatus.publishState.publishedDrawIds.includes(drawId);
        if (published) publishState[drawId] = { published };
      }
    }
    return { ...SUCCESS, publishState };
  } else if (event) {
    const pubStatus: any = getPubStatus({ event });
    if (pubStatus.error) return pubStatus;
    if (drawId) {
      return {
        publishState: {
          published: pubStatus.publishState.publishedDrawIds.includes(drawId),
          ...SUCCESS,
        },
      };
    } else if (Array.isArray(drawIds) && drawIds?.length) {
      const publishState: any = {};
      for (const drawId of drawIds) {
        if (!isString(drawId)) return { error: INVALID_VALUES };
        publishState[drawId] = {
          published: pubStatus.publishState.publishedDrawIds.includes(drawId),
        };
        return { ...SUCCESS, publishState };
      }
    } else {
      return pubStatus;
    }
  }

  return { error: INVALID_VALUES };
}

function getPubStatus({ event }): any {
  const eventPubStatus = getEventPublishStatus({ event });
  if (!eventPubStatus) return { error: EVENT_NOT_FOUND };

  const publishedSeeding = {
    published: undefined, // seeding can be present for all entries in an event when no flights have been defined
    seedingScaleNames: [],
    drawIds: [], // seeding can be specific to drawIds
  };

  if (eventPubStatus.seeding) {
    Object.assign(publishedSeeding, eventPubStatus.seeding);
  }

  const { drawDetails } = eventPubStatus;

  const publishedDrawIds =
    (drawDetails && Object.keys(drawDetails).filter((drawId) => getDrawPublishStatus({ drawDetails, drawId }))) ||
    eventPubStatus.drawIds ||
    [];

  return {
    publishState: {
      published: publishedDrawIds.length > 0,
      publishedDrawIds,
      publishedSeeding,
      drawDetails,
    },
    ...SUCCESS,
  };
}
