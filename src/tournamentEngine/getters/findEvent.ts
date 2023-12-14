import { getFlightProfile } from './getFlightProfile';
import {
  ResultType,
  decorateResult,
} from '../../global/functions/decorateResult';

import {
  DRAW_DEFINITION_NOT_FOUND,
  EVENT_NOT_FOUND,
  MISSING_TOURNAMENT_RECORD,
} from '../../constants/errorConditionConstants';
import { DrawDefinition, Tournament, Event } from '../../types/tournamentTypes';

// INTERNAL_USE: to resovle events by eventId or drawId
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
  event?: Event;
  drawDefinition?: DrawDefinition;
} {
  const stack = 'findEvent';
  if (!tournamentRecord)
    return decorateResult({
      result: { error: MISSING_TOURNAMENT_RECORD },
      stack,
    });
  const events = tournamentRecord?.events ?? [];

  if (drawId) {
    let drawDefinition;
    const event = events.find((event) => {
      const drawDefinitions = event?.drawDefinitions ?? [];
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
