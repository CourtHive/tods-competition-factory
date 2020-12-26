import { makeDeepCopy } from '../../utilities';

import {
  DRAW_DEFINITION_NOT_FOUND,
  MISSING_DRAW_ID,
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../constants/errorConditionConstants';
import { SUCCESS } from '../../constants/resultConstants';

export function getEvent({ tournamentRecord, drawDefinition, event, context }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const eventCopy = makeDeepCopy(event);
  if (context) Object.assign(eventCopy, context);

  const drawDefinitionCopy = drawDefinition && makeDeepCopy(drawDefinition);

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
  if (eventId) {
    const event = events.reduce((event, candidate) => {
      return candidate.eventId === eventId ? candidate : event;
    }, undefined);
    return { event };
  } else if (drawId) {
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

    return { event, drawDefinition };
  }
  return {};
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
