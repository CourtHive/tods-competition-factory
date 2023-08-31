import {
  ResultType,
  decorateResult,
} from '../../global/functions/decorateResult';
import { definedAttributes, makeDeepCopy } from '../../utilities';
import { getFlightProfile } from './getFlightProfile';

import { SUCCESS } from '../../constants/resultConstants';
import {
  DRAW_DEFINITION_NOT_FOUND,
  EVENT_NOT_FOUND,
  MISSING_DRAW_ID,
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../constants/errorConditionConstants';
import {
  DrawDefinition,
  Tournament,
  Event,
} from '../../types/tournamentFromSchema';

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
    event: eventCopy,
    drawDefinition: drawDefinitionCopy,
  });
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

type FindEventArgs = {
  tournamentRecord: Tournament;
  eventId?: string;
  drawId?: string;
};
export function findEvent({
  tournamentRecord,
  eventId,
  drawId,
}: FindEventArgs): ResultType & {
  event: Event | undefined;
  drawDefinition: DrawDefinition | undefined;
} {
  const stack = 'findEvent';
  if (!tournamentRecord)
    return {
      event: undefined,
      drawDefinition: undefined,
      ...decorateResult({
        result: { error: MISSING_TOURNAMENT_RECORD },
        stack,
      }),
    };
  const events = tournamentRecord?.events || [];

  if (drawId) {
    let drawDefinition;
    const event = events.find((event) => {
      const drawDefinitions = event?.drawDefinitions || [];
      const targetDrawDefinition = drawDefinitions.find(
        (drawDefinition) => drawDefinition.drawId === drawId
      );
      if (targetDrawDefinition) {
        drawDefinition = targetDrawDefinition;
      } else {
        const { flightProfile } = getFlightProfile({ event });
        const flight = flightProfile?.flights?.find(
          (flight) => flight.drawId === drawId
        );
        if (flight)
          return {
            drawId,
            entries: flight.drawEntries,
            drawName: flight.drawName,
          };
      }
      return targetDrawDefinition;
    });

    if (event) return { event, drawDefinition };
  }

  if (eventId) {
    const event = events.find((event) => event.eventId === eventId);
    if (!event)
      return {
        event: undefined,
        drawDefinition: undefined,
        ...decorateResult({ result: { error: EVENT_NOT_FOUND }, stack }),
      };
    return { event, drawDefinition: undefined };
  }

  return {
    event: undefined,
    drawDefinition: undefined,
    ...decorateResult({
      result: { error: DRAW_DEFINITION_NOT_FOUND },
      context: { drawId, eventId },
      stack,
    }),
  };
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

  return target
    ? { ...target, SUCCESS }
    : decorateResult({
        result: { error: DRAW_DEFINITION_NOT_FOUND },
        stack: 'getDrawDefinition',
      });
}
