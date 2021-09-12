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

  const { tournamentId } = tournamentRecord;
  const eventCopies = (tournamentRecord.events || []).map((event) => {
    const eventCopy = makeDeepCopy(event);
    if (context) Object.assign(eventCopy, context);
    if (inContext) Object.assign(eventCopy, { tournamentId });
    return eventCopy;
  });

  return { events: eventCopies };
}

export function findEvent({ tournamentRecord, eventId, drawId }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const events = tournamentRecord?.events || [];

  if (drawId) {
    let drawDefinition;
    const event = events.find((event) => {
      const drawDefinitions = event?.drawDefinitions || [];
      const targetDrawDefinition = drawDefinitions.find(
        (drawDefinition) => drawDefinition.drawId === drawId
      );
      if (targetDrawDefinition) drawDefinition = targetDrawDefinition;
      return targetDrawDefinition;
    });

    if (event) return { event, drawDefinition };
  }

  if (eventId) {
    const event = events.find((event) => event.eventId === eventId);
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
