import { makeDeepCopy } from '../../utilities';

import { SUCCESS } from '../../constants/resultConstants';
import {
  DRAW_DEFINITION_NOT_FOUND,
  EVENT_NOT_FOUND,
  MISSING_DRAW_ID,
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
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

  return { event: eventCopy, drawDefinition: drawDefinitionCopy };
}

export function getEvents({ tournamentRecord, context, inContext }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const eventCopies = (tournamentRecord.events || []).map((event) => {
    const eventCopy = makeDeepCopy(event);
    if (context) Object.assign(eventCopy, context);
    return eventCopy;
  });

  if (inContext) {
    console.log('TODO: add context');
  }

  return { events: eventCopies };
}

export function findEvent({ tournamentRecord, eventId, drawId }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const events = tournamentRecord?.events || [];

  if (drawId) {
    const { event, drawDefinition } = events.reduce((result, candidate) => {
      const drawDefinitions = (candidate && candidate.drawDefinitions) || [];
      const drawDefinition = drawDefinitions.reduce(
        (drawDefinition, candidate) => {
          return candidate.drawId === drawId ? candidate : drawDefinition;
        },
        undefined
      );
      return drawDefinition ? { event: candidate, drawDefinition } : result;
    }, {});

    if (!event) return { error: EVENT_NOT_FOUND };
    return { event, drawDefinition };
  } else if (eventId) {
    const event = events.reduce((event, candidate) => {
      return candidate.eventId === eventId ? candidate : event;
    }, undefined);
    if (!event) return { error: EVENT_NOT_FOUND };
    return { event };
  }

  return { error: MISSING_VALUE };
}

export function getDrawDefinition({ tournamentRecord, drawId }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawId) {
    return { error: MISSING_DRAW_ID };
  }

  const target = (tournamentRecord.events || []).reduce((target, event) => {
    const candidate = (event.drawDefinitions || []).reduce(
      (drawDefinition, candidate) => {
        return candidate.drawId === drawId ? candidate : drawDefinition;
      },
      undefined
    );
    return candidate && candidate.drawId === drawId
      ? { event, drawDefinition: candidate }
      : target;
  }, undefined);

  return target ? { ...target, SUCCESS } : { error: DRAW_DEFINITION_NOT_FOUND };
}
