import { getAssignedParticipantIds } from '../drawDefinition/getAssignedParticipantIds';
import { getDrawId, getParticipantId } from '../../functions/global/extractors';
import { definedAttributes } from '../../tools/definedAttributes';
import { getParticipants } from '../participants/getParticipants';
import { makeDeepCopy } from '../../tools/makeDeepCopy';
import { getFlightProfile } from '../event/getFlightProfile';
import { intersection } from '../../tools/arrays';
import { median } from '../../tools/math';

import { MISSING_TOURNAMENT_RECORD } from '../../constants/errorConditionConstants';
import { STRUCTURE_SELECTED_STATUSES } from '../../constants/entryStatusConstants';
import { Event, Tournament, EventTypeUnion } from '../../types/tournamentTypes';
import ratingsParameters from '../../fixtures/ratings/ratingsParameters';
import { ResultType } from '../../functions/global/decorateResult';
import { INDIVIDUAL } from '../../constants/participantConstants';
import { SUCCESS } from '../../constants/resultConstants';

export type RankingStat = {
  median: number;
  avg: number;
  max: number;
  min: number;
};

export type EventScaleValues = {
  [key: string]: {
    ratingsStats: { [key: string]: RankingStat };
    ratings: { [key: string]: number[] };
    ranking: { [key: string]: any };
    draws: {
      [key: string]: {
        ratingsStats: { [key: string]: RankingStat };
        ratings: { [key: string]: number[] };
        ranking: { [key: string]: any };
      };
    };
  };
};

type GetEventsArgs = {
  tournamentRecord: Tournament;
  withScaleValues?: boolean;
  scaleEventType?: EventTypeUnion;
  inContext?: boolean;
  eventIds?: string[];
  drawIds?: string[];
  context?: any;
};

export function getEvents({
  tournamentRecord,
  withScaleValues,
  scaleEventType,
  inContext, // hydrate with tournamentId
  eventIds, // only return events with these eventIds
  drawIds, // only return events with these drawIds, and only drawDefinitions with these drawIds
  context, // additional context to add to each event
}: GetEventsArgs): ResultType & {
  eventScaleValues?: EventScaleValues;
  events?: Event[];
} {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const { tournamentId } = tournamentRecord;
  const eventCopies = (tournamentRecord.events ?? [])
    .filter(({ eventId }) => !eventIds || (Array.isArray(eventIds) && eventIds.includes(eventId)))
    .map((event) => {
      const eventDrawIds = event.drawDefinitions?.map(getDrawId);
      if (drawIds?.length && !intersection(drawIds, eventDrawIds).length) return;
      const eventCopy = makeDeepCopy(event);
      if (inContext) Object.assign(eventCopy, { tournamentId });
      if (context) Object.assign(eventCopy, context);
      return eventCopy;
    })
    .filter(Boolean);

  const eventsMap = {};

  if (withScaleValues) {
    const participantMap = getParticipants({
      withScaleValues: true,
      tournamentRecord,
    }).participantMap;

    const sum = (values) => values.reduce((total, value) => total + parseFloat(value), 0);

    for (const event of eventCopies) {
      const eventType = scaleEventType ?? event.eventType;
      const eventId = event.eventId;

      if (!eventsMap[eventId])
        eventsMap[eventId] = {
          ratingsStats: {},
          ratings: {},
          ranking: {},
          draws: {},
        };

      const selectedEntries = (event.entries ?? []).filter(({ entryStatus }) =>
        STRUCTURE_SELECTED_STATUSES.includes(entryStatus),
      );
      const participantIds = selectedEntries.map(getParticipantId);

      const processParticipant = (participant) => {
        if (participant?.ratings?.[eventType]) {
          for (const rating of participant?.ratings?.[eventType] ?? []) {
            const scaleName = rating.scaleName;
            if (!eventsMap[eventId].ratings[scaleName]) eventsMap[eventId].ratings[scaleName] = [];
            const accessor = ratingsParameters[scaleName]?.accessor;
            if (accessor) {
              const value = parseFloat(rating.scaleValue?.[accessor]);
              if (value) eventsMap[eventId].ratings[scaleName].push(value);
            }
          }
        }
        if (participant?.rankings?.[eventType]) {
          for (const ranking of participant?.rankings?.[eventType] ?? []) {
            const scaleName = ranking.scaleName;
            if (!eventsMap[eventId].ranking[scaleName]) eventsMap[eventId].ranking[scaleName] = [];
            if (ranking.scaleValue) eventsMap[eventId].ranking[scaleName].push(ranking.scaleValue);
          }
        }
      };

      for (const participantId of participantIds) {
        const participant = participantMap?.[participantId]?.participant;
        if (participant?.participantType !== INDIVIDUAL) {
          for (const individualParticipantId of participant?.individualParticipantIds ?? []) {
            const individualParticipant = participantMap?.[individualParticipantId]?.participant;
            processParticipant(individualParticipant);
          }
        } else {
          processParticipant(participant);
        }
      }

      // add stats for all event-level entries ratings
      const ratings = eventsMap[eventId].ratings;
      for (const scaleName of Object.keys(ratings)) {
        const scaleRating = ratings[scaleName];
        if (!scaleRating.length) continue;
        const med = median(scaleRating)?.toFixed(2);
        eventsMap[eventId].ratingsStats[scaleName] = {
          avg: parseFloat((sum(scaleRating) / scaleRating.length).toFixed(2)),
          median: med ? parseFloat(med) : undefined,
          max: Math.max(...scaleRating),
          min: Math.min(...scaleRating),
        };
      }

      const processFlight = (drawId, participantIds) => {
        const processParticipant = (participant) => {
          if (eventsMap[eventId].draws?.[drawId] && participant?.ratings?.[eventType]) {
            for (const rating of participant?.ratings?.[eventType] ?? []) {
              const scaleName = rating.scaleName;
              if (!eventsMap[eventId].draws[drawId]?.ratings[scaleName])
                eventsMap[eventId].draws[drawId].ratings[scaleName] = [];
              const accessor = ratingsParameters[scaleName]?.accessor;
              if (accessor) {
                const value = parseFloat(rating.scaleValue?.[accessor]);
                if (value) {
                  eventsMap[eventId].draws[drawId].ratings[scaleName].push(value);
                }
              }
            }
          }
          if (eventsMap[eventId].draws?.[drawId] && participant?.rankings?.[eventType]) {
            for (const ranking of participant?.rankings?.[eventType] ?? []) {
              const scaleName = ranking.scaleName;
              if (!eventsMap[eventId].draws[drawId]?.ranking[scaleName])
                eventsMap[eventId].draws[drawId].ranking[scaleName] = [];
              const value = ranking.scaleValue;
              if (value) {
                eventsMap[eventId].draws[drawId].ranking[scaleName].push(value);
              }
            }
          }
        };
        for (const participantId of participantIds.filter(Boolean)) {
          const participant = participantMap?.[participantId]?.participant;
          if (participant?.participantType !== INDIVIDUAL) {
            for (const individualParticipantId of participant?.individualParticipantIds ?? []) {
              const individualParticipant = participantMap?.[individualParticipantId]?.participant;
              processParticipant(individualParticipant);
            }
          } else {
            processParticipant(participant);
          }
        }
      };

      const processedDrawIds: string[] = [];
      const ignoreDrawId = (drawId) =>
        (drawIds?.length && drawIds.includes(drawId)) || processedDrawIds.includes(drawId);
      for (const drawDefinition of event.drawDefinitions ?? []) {
        const drawId: string = drawDefinition.drawId;
        if (ignoreDrawId(drawId)) continue;

        const participantIds =
          getAssignedParticipantIds({
            drawDefinition,
          }).assignedParticipantIds ?? [];
        if (!eventsMap[eventId].draws[drawId])
          eventsMap[eventId].draws[drawId] = {
            ratingsStats: {},
            ratings: {},
            ranking: {},
          };
        processedDrawIds.push(drawId);
        processFlight(drawId, participantIds);
      }

      const flightProfile = getFlightProfile({ event }).flightProfile;
      for (const flight of flightProfile?.flights ?? []) {
        const drawId = flight.drawId;
        if (ignoreDrawId(drawId)) continue;
        const participantIds = flight.drawEntries.map(getParticipantId);
        processFlight(drawId, participantIds);
      }

      for (const drawId of processedDrawIds) {
        const ratings = eventsMap[eventId].draws[drawId].ratings;
        for (const scaleName of Object.keys(ratings)) {
          const scaleRating = ratings[scaleName];
          if (!scaleRating.length) continue;
          const med = median(scaleRating)?.toFixed(2);
          eventsMap[eventId].draws[drawId].ratingsStats[scaleName] = {
            avg: parseFloat((sum(scaleRating) / scaleRating.length).toFixed(2)),
            median: med ? parseFloat(med) : undefined,
            max: Math.max(...scaleRating),
            min: Math.min(...scaleRating),
          };
        }
      }
    }
  }

  return definedAttributes({
    eventScaleValues: eventsMap,
    events: eventCopies,
    ...SUCCESS,
  });
}
