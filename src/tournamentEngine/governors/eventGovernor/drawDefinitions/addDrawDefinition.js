import { addEventExtension } from '../../tournamentGovernor/addRemoveExtensions';
import { getFlightProfile } from '../../../getters/getFlightProfile';
import { allDrawMatchUps } from '../../../getters/matchUpsGetter';
import { getTopics } from '../../../../global/globalState';
import {
  addDrawNotice,
  addMatchUpsNotice,
} from '../../../../drawEngine/notifications/drawNotifications';

import { FLIGHT_PROFILE } from '../../../../constants/extensionConstants';
import { ADD_MATCHUPS } from '../../../../constants/topicConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  DRAW_ID_EXISTS,
  INVALID_DRAW_DEFINITION,
  INVALID_VALUES,
  MISSING_DRAW_ID,
  MISSING_EVENT,
} from '../../../../constants/errorConditionConstants';

export function addDrawDefinition({
  drawDefinition,
  event,
  flight: flightDefinition,
  existingDrawCount,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_ID };
  if (!event) return { error: MISSING_EVENT };

  if (!event.drawDefinitions) event.drawDefinitions = [];
  const { drawId, drawName, entries: drawEntries } = drawDefinition;

  if (
    existingDrawCount !== undefined &&
    existingDrawCount !== event.drawDefinitions.length
  )
    return { error: INVALID_VALUES, message: 'drawDefintions count mismatch' };

  const drawDefinitionExists = !!event.drawDefinitions.find(
    (drawDefinition) => drawDefinition.drawId === drawId
  );

  if (drawDefinitionExists) return { error: DRAW_ID_EXISTS };

  const { flightProfile } = getFlightProfile({ event });
  const flightConflict =
    flightDefinition &&
    !!flightProfile?.flights?.find(
      (flight) =>
        flight.flightNumber === flightDefinition.flightNumber &&
        flight.drawId !== drawDefinition.drawId
    );

  if (flightConflict) return { error: INVALID_DRAW_DEFINITION };

  const flightNumbers =
    flightProfile?.flights
      ?.map(
        ({ flightNumber }) => !isNaN(flightNumber) && parseInt(flightNumber)
      )
      ?.filter(Boolean) || [];

  const drawOrders =
    event.drawDefinitions
      .map(({ drawOrder }) => !isNaN(drawOrder) && parseInt(drawOrder))
      ?.filter(Boolean) || [];

  let drawOrder = Math.max(0, ...drawOrders, ...flightNumbers) + 1;

  const flight = flightProfile?.flights?.find(
    (flight) => flight.drawId === drawId
  );

  let extension;
  if (flight) {
    // if this drawId was defined in a flightProfile...
    // ...update the flight.drawName with the drawName in the drawDefinition
    flight.drawName = drawDefinition.drawName;
    extension = {
      name: FLIGHT_PROFILE,
      value: {
        ...flightProfile,
        flights: flightProfile.flights,
      },
    };

    const flightNumber = flight.flightNumber;
    if (flightNumber && !drawOrders.includes(flightNumber)) {
      drawOrder = flightNumber;
    } else {
      flight.flightNumber = drawOrder;
    }
  } else {
    const flights = flightProfile?.flights || [];
    flights.push({
      manuallyAdded: true, // this drawDefinition was not part of automated split
      flightNumber: drawOrder,
      drawEntries,
      drawName,
      drawId,
    });
    extension = {
      name: FLIGHT_PROFILE,
      value: {
        ...(flightProfile || {}),
        flights,
      },
    };
  }

  addEventExtension({ event, extension });
  Object.assign(drawDefinition, { drawOrder });
  event.drawDefinitions.push(drawDefinition);

  const { topics } = getTopics();
  if (topics.includes(ADD_MATCHUPS)) {
    const { matchUps } = allDrawMatchUps({ drawDefinition, event });
    addMatchUpsNotice({ drawDefinition, matchUps });
  }

  addDrawNotice({ drawDefinition });

  return { ...SUCCESS };
}
