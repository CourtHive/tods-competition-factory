import { getTournamentPublishStatus } from '@Query/tournaments/getTournamentPublishStatus';
import { getEventPublishStatus } from '@Query/event/getEventPublishStatus';
import { getDrawPublishStatus } from '@Query/event/getDrawPublishStatus';
import { getDrawId } from '@Functions/global/extractors';

// constants and types
import { DrawDefinition, Event, Tournament } from '@Types/tournamentTypes';
import { SUCCESS } from '@Constants/resultConstants';
import { ResultType } from '@Types/factoryTypes';
import { findEvent } from '../../acquire/findEvent';
import { isString } from '@Tools/objects';
import {
  DRAW_DEFINITION_NOT_FOUND,
  EVENT_NOT_FOUND,
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
} from '@Constants/errorConditionConstants';

type GetPublishStateArgs = {
  tournamentRecord?: Tournament;
  drawDefinition?: DrawDefinition;
  eventIds?: string[];
  drawIds?: string[];
  eventId?: string;
  drawId?: string;
  event: Event;
};

export function getPublishState({
  tournamentRecord,
  drawDefinition,
  eventIds,
  eventId,
  drawIds,
  drawId,
  event,
}: GetPublishStateArgs): ResultType & {
  publishState?: any;
} {
  if (eventId && !event) {
    return { error: EVENT_NOT_FOUND };
  } else if (Array.isArray(eventIds) && eventIds?.length) {
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
  } else if (event) {
    const pubStatus: any = getPubStatus({ event });
    if (pubStatus.error) return pubStatus;
    if (drawId) {
      if (!drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };
      return {
        publishState: {
          status: {
            published: !!pubStatus.status.publishedDrawIds?.includes(drawId),
            drawDetail: pubStatus.status.drawDetails?.[drawId],
          },
          ...SUCCESS,
        },
      };
    } else if (Array.isArray(drawIds) && drawIds?.length) {
      const publishState: any = {};
      for (const drawId of drawIds) {
        if (!isString(drawId)) return { error: INVALID_VALUES };
        publishState[drawId] = {
          status: {
            published: !!pubStatus.status.publishedDrawIds.includes(drawId),
            drawDetail: pubStatus.status.drawDetails?.[drawId],
          },
        };
        return { ...SUCCESS, publishState };
      }
    } else {
      return { publishState: pubStatus };
    }
  } else if (!tournamentRecord) {
    return { error: MISSING_TOURNAMENT_RECORD };
  } else {
    const publishState: any = {};
    const pubStatus: any = getTournamentPublishStatus({ tournamentRecord });
    publishState.tournament = pubStatus;
    for (const event of tournamentRecord.events ?? []) {
      const pubStatus: any = getPubStatus({ event });
      publishState[event.eventId] = pubStatus;
      if (pubStatus.error) return pubStatus;
      for (const { drawId } of event.drawDefinitions ?? []) {
        if (!isString(drawId)) return { error: INVALID_VALUES };
        const published = pubStatus.publishState?.publishedDrawIds?.includes(drawId);
        if (published) {
          publishState[drawId] = { status: { published } };
        }
      }
    }
    return { ...SUCCESS, publishState };
  }

  return { error: INVALID_VALUES };
}

function getPubStatus({ event }): any {
  const eventPubStatus = getEventPublishStatus({ event });
  if (!eventPubStatus) return { status: { published: false } };

  const publishedSeeding = {
    published: undefined, // seeding can be present for all entries in an event when no flights have been defined
    seedingScaleNames: [],
    drawIds: [], // seeding can be specific to drawIds
  };

  if (eventPubStatus.seeding) {
    Object.assign(publishedSeeding, eventPubStatus.seeding);
  }

  const drawDetails = eventPubStatus.drawDetails ?? {};
  for (const drawId of event.drawDefinitions?.map(getDrawId) || []) {
    if (!drawDetails[drawId]) {
      drawDetails[drawId] = {
        publishingDetail: { published: false },
      };
    }
  }

  const publishedDrawIds =
    (drawDetails && Object.keys(drawDetails).filter((drawId) => getDrawPublishStatus({ drawDetails, drawId }))) ||
    eventPubStatus.drawIds ||
    [];

  return {
    status: {
      published: publishedDrawIds.length > 0,
      publishedDrawIds,
      publishedSeeding,
      drawDetails,
    },
  };
}
