import { definedAttributes } from '@Tools/definedAttributes';
import { makeDeepCopy } from '@Tools/makeDeepCopy';

import { DrawDefinition, Event, Tournament } from '@Types/tournamentTypes';
import { MISSING_EVENT, MISSING_TOURNAMENT_RECORD } from '@Constants/errorConditionConstants';

type GetEventArgs = {
  context: { [key: string]: any };
  tournamentRecord: Tournament;
  drawDefinition: DrawDefinition;
  event: Event;
};

export function getEvent({ tournamentRecord, drawDefinition, context, event }: GetEventArgs) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const eventCopy = makeDeepCopy(event);
  if (context) Object.assign(eventCopy, context);

  const drawDefinitionCopy =
    drawDefinition && eventCopy.drawDefinitions?.find(({ drawId }) => drawDefinition.drawId === drawId);

  return definedAttributes({
    drawDefinition: drawDefinitionCopy,
    event: eventCopy,
  });
}
