import { addEventExtension } from '../../tournamentGovernor/addRemoveExtensions';
import { addNotice, getTopics } from '../../../../global/globalState';
import { getFlightProfile } from '../../../getters/getFlightProfile';
import { allDrawMatchUps } from '../../../getters/matchUpsGetter';

import { SUCCESS } from '../../../../constants/resultConstants';
import {
  DRAW_ID_EXISTS,
  MISSING_DRAW_ID,
  MISSING_EVENT,
} from '../../../../constants/errorConditionConstants';
import { FLIGHT_PROFILE } from '../../../../constants/extensionConstants';
import { ADD_MATCHUPS } from '../../../../constants/topicConstants';

export function addDrawDefinition({ drawDefinition, event }) {
  if (!drawDefinition) return { error: MISSING_DRAW_ID };
  if (!event) return { error: MISSING_EVENT };

  if (!event.drawDefinitions) event.drawDefinitions = [];
  const { drawId, drawName, entries: drawEntries } = drawDefinition;

  const drawDefinitionExists = event.drawDefinitions.reduce(
    (exists, candidate) => {
      return candidate.drawId === drawId ? true : exists;
    },
    undefined
  );

  if (drawDefinitionExists) return { error: DRAW_ID_EXISTS };
  const drawOrders =
    event.drawDefinitions
      .map(({ drawOrder }) => !isNaN(drawOrder) && parseInt(drawOrder))
      ?.filter(Boolean) || [];

  const { flightProfile } = getFlightProfile({ event });
  const flight = flightProfile?.flights?.find(
    (flight) => flight.drawId === drawId
  );

  const flightNumbers =
    flightProfile?.flights
      ?.map(
        ({ flightNumber }) => !isNaN(flightNumber) && parseInt(flightNumber)
      )
      ?.filter(Boolean) || [];

  let drawOrder = Math.max(0, ...drawOrders, ...flightNumbers) + 1;

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
    addNotice({ topic: ADD_MATCHUPS, payload: { matchUps } });
  }

  return SUCCESS;
}
