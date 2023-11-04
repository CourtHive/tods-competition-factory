import { getAssignedParticipantIds } from '../../drawEngine/getters/getAssignedParticipantIds';
import { getParticipants } from './participants/getParticipants';
import { getFlightProfile } from './getFlightProfile';
import { median } from '../../utilities/math';
import {
  definedAttributes,
  extractAttributes as xa,
  makeDeepCopy,
} from '../../utilities';

import { STRUCTURE_SELECTED_STATUSES } from '../../constants/entryStatusConstants';
import { Tournament, TypeEnum } from '../../types/tournamentFromSchema';
import ratingsParameters from '../../fixtures/ratings/ratingsParameters';
import { INDIVIDUAL } from '../../constants/participantConstants';
import { SUCCESS } from '../../constants/resultConstants';
import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../constants/errorConditionConstants';

export function getEvent({ tournamentRecord, drawDefinition, event, context }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const eventCopy = makeDeepCopy(event);
  if (context) Object.assign(eventCopy, context);

  const drawDefinitionCopy =
    drawDefinition &&
    eventCopy.drawDefinitions?.find(
      ({ drawId }) => drawDefinition.drawId === drawId
    );

  return definedAttributes({
    drawDefinition: drawDefinitionCopy,
    event: eventCopy,
  });
}

type GetEventsArgs = {
  tournamentRecord: Tournament;
  withScaleValues?: boolean;
  scaleEventType?: TypeEnum;
  inContext?: boolean;
  eventIds?: string[];
  drawIds?: string[];
  context?: any;
};

export function getEvents({
  tournamentRecord,
  withScaleValues,
  scaleEventType,
  inContext,
  eventIds,
  drawIds,
  context,
}: GetEventsArgs) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const { tournamentId } = tournamentRecord;
  const eventCopies = (tournamentRecord.events ?? [])
    .filter(
      ({ eventId }) =>
        !eventIds || (Array.isArray(eventIds) && eventIds.includes(eventId))
    )
    .map((event) => {
      const eventCopy = makeDeepCopy(event);
      if (inContext) Object.assign(eventCopy, { tournamentId });
      if (context) Object.assign(eventCopy, context);
      return eventCopy;
    });

  const eventsMap = {};

  if (withScaleValues) {
    const participantMap = getParticipants({
      withScaleValues: true,
      tournamentRecord,
    }).participantMap;

    const sum = (values) =>
      values.reduce((total, value) => total + parseFloat(value), 0);

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
        STRUCTURE_SELECTED_STATUSES.includes(entryStatus)
      );
      const participantIds = selectedEntries.map(xa('participantId'));

      const processParticipant = (participant) => {
        if (participant?.ratings?.[eventType]) {
          for (const rating of participant?.ratings?.[eventType] ?? []) {
            const scaleName = rating.scaleName;
            if (!eventsMap[eventId].ratings[scaleName])
              eventsMap[eventId].ratings[scaleName] = [];
            const accessor = ratingsParameters[scaleName]?.accessor;
            if (accessor) {
              const value = parseFloat(rating.scaleValue?.[accessor]);
              if (value) eventsMap[eventId].ratings[scaleName].push(value);
            }
          }
        }
      };

      for (const participantId of participantIds) {
        const participant = participantMap?.[participantId]?.participant;
        if (participant?.participantType !== INDIVIDUAL) {
          for (const individualParticipantId of participant?.individualParticipantIds ??
            []) {
            const individualParticipant =
              participantMap?.[individualParticipantId]?.participant;
            processParticipant(individualParticipant);
          }
        } else {
          processParticipant(participant);
        }
      }

      // add stats for all event-level entries ratings
      const ratings = eventsMap[eventId].ratings;
      for (const scaleName of Object.keys(ratings)) {
        eventsMap[eventId].ratingsStats[scaleName] = {
          avg: sum(ratings[scaleName]) / ratings[scaleName].length,
          median: median(ratings[scaleName]),
          max: Math.max(...ratings[scaleName]),
          min: Math.min(...ratings[scaleName]),
        };
      }

      const processFlight = (drawId, participantIds) => {
        const processParticipant = (participant) => {
          if (participant?.ratings?.[eventType]) {
            for (const rating of participant?.ratings?.[eventType] ?? []) {
              const scaleName = rating.scaleName;
              if (!eventsMap[eventId].draws[drawId].ratings[scaleName])
                eventsMap[eventId].draws[drawId].ratings[scaleName] = [];
              const accessor = ratingsParameters[scaleName]?.accessor;
              if (accessor) {
                const value = parseFloat(rating.scaleValue?.[accessor]);
                if (value) {
                  eventsMap[eventId].draws[drawId].ratings[scaleName].push(
                    value
                  );
                }
              }
            }
          }
        };
        for (const participantId of participantIds.filter(Boolean)) {
          const participant = participantMap?.[participantId]?.participant;
          if (participant?.participantType !== INDIVIDUAL) {
            for (const individualParticipantId of participant?.individualParticipantIds ??
              []) {
              const individualParticipant =
                participantMap?.[individualParticipantId]?.participant;
              processParticipant(individualParticipant);
            }
          } else {
            processParticipant(participant);
          }
        }
      };

      const processedDrawIds: string[] = [];
      const ignoreDrawId = (drawId) =>
        (drawIds?.length && drawIds.includes(drawId)) ||
        processedDrawIds.includes(drawId);
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
        const participantIds = flight.drawEntries.map(xa('participantId'));
        processFlight(drawId, participantIds);
      }

      for (const drawId of processedDrawIds) {
        const ratings = eventsMap[eventId].draws[drawId].ratings;
        for (const scaleName of Object.keys(ratings)) {
          eventsMap[eventId].draws[drawId].ratingsStats[scaleName] = {
            avg: sum(ratings[scaleName]) / ratings[scaleName].length,
            median: median(ratings[scaleName]),
            max: Math.max(...ratings[scaleName]),
            min: Math.min(...ratings[scaleName]),
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
