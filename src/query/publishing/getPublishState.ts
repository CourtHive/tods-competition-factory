import { getTournamentPublishStatus } from '@Query/tournaments/getTournamentPublishStatus';
import { isValidTournamentRecord } from '@Validators/isValidTournamentRecord';
import { getEventPublishStatus } from '@Query/event/getEventPublishStatus';
import { getDrawPublishStatus } from '@Query/event/getDrawPublishStatus';
import { getDrawId } from '@Functions/global/extractors';

// constants and types
import { DRAW_DEFINITION_NOT_FOUND, EVENT_NOT_FOUND, INVALID_VALUES } from '@Constants/errorConditionConstants';
import { DrawDefinition, Event, Tournament } from '@Types/tournamentTypes';
import { SUCCESS } from '@Constants/resultConstants';
import { ResultType } from '@Types/factoryTypes';
import { findEvent } from '@Acquire/findEvent';
import { isString } from '@Tools/objects';

type GetPublishStateArgs = {
  tournamentRecord?: Tournament;
  drawDefinition?: DrawDefinition;
  eventIds?: string[];
  drawIds?: string[];
  eventId?: string;
  drawId?: string;
  event?: Event;
};

export function getPublishState(params: GetPublishStateArgs): ResultType & { publishState?: any } {
  const { tournamentRecord, drawDefinition, eventIds, eventId, drawIds, drawId, event } = params ?? {};
  if (tournamentRecord && !isValidTournamentRecord(tournamentRecord)) return { error: INVALID_VALUES };

  if (eventId && !event) return { error: EVENT_NOT_FOUND };

  if (Array.isArray(eventIds) && eventIds?.length) {
    const publishState: any = {};
    for (const eventId of eventIds) {
      if (!isString(eventId)) return { error: INVALID_VALUES };
      const event: Event | undefined = findEvent({ tournamentRecord, eventId })?.event;
      if (!event) return { error: EVENT_NOT_FOUND };
      const pubStatus: any = getPubStatus({ event });
      publishState[eventId] = pubStatus;
    }
    return { ...SUCCESS, publishState };
  }

  if (event) {
    const pubStatus: any = getPubStatus({ event });
    let publishState: any = {};

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
      const eventDrawIds = event.drawDefinitions?.map(getDrawId) || [];
      for (const drawId of drawIds) {
        if (!isString(drawId)) return { error: INVALID_VALUES };
        if (!eventDrawIds.includes(drawId)) return { error: DRAW_DEFINITION_NOT_FOUND };
        publishState[drawId] = {
          status: {
            published: !!pubStatus.status.publishedDrawIds.includes(drawId),
            drawDetail: pubStatus.status.drawDetails?.[drawId],
          },
        };
      }
    } else {
      publishState = pubStatus;
    }

    return { ...SUCCESS, publishState };
  }

  const publishedEventIds: string[] = [];
  let tournamentPublished = false;
  const publishState: any = {};

  const pubStatus: any = getTournamentPublishStatus({ tournamentRecord });
  publishState.tournament = pubStatus ?? {};

  for (const event of tournamentRecord?.events ?? []) {
    const pubStatus: any = getPubStatus({ event });
    publishState[event.eventId] = pubStatus;
    if (pubStatus.status.published) {
      publishedEventIds.push(event.eventId);
      tournamentPublished = true;
    }
    for (const { drawId } of event.drawDefinitions ?? []) {
      const published = pubStatus.status?.publishedDrawIds?.includes(drawId);
      if (published) publishState[drawId] = { status: { published } };
    }
  }

  if (tournamentRecord) {
    publishState.tournament.status = { published: tournamentPublished, publishedEventIds };
  }

  return { ...SUCCESS, publishState };
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
    (drawDetails &&
      Object.keys(drawDetails).length &&
      Object.keys(drawDetails).filter((drawId) => getDrawPublishStatus({ drawDetails, drawId }))) ||
    eventPubStatus.drawIds;

  return {
    status: {
      published: publishedDrawIds && publishedDrawIds.length > 0,
      publishedDrawIds,
      publishedSeeding,
      drawDetails,
    },
  };
}
