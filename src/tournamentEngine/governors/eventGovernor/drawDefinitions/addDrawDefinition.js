import { addEventExtension } from '../../tournamentGovernor/addRemoveExtensions';
import { getFlightProfile } from '../../../getters/getFlightProfile';
import { allDrawMatchUps } from '../../../getters/matchUpsGetter';
import { addNotice } from '../../../../global/globalState';

import { SUCCESS } from '../../../../constants/resultConstants';
import {
  DRAW_ID_EXISTS,
  MISSING_DRAW_ID,
  MISSING_EVENT,
} from '../../../../constants/errorConditionConstants';
import { FLIGHT_PROFILE } from '../../../../constants/flightConstants';

export function addDrawDefinition({ drawDefinition, event }) {
  if (!drawDefinition) return { error: MISSING_DRAW_ID };
  if (!event) return { error: MISSING_EVENT };

  if (!event.drawDefinitions) event.drawDefinitions = [];
  const drawDefinitionExists = event.drawDefinitions.reduce(
    (exists, candidate) => {
      return candidate.drawId === drawDefinition.drawId ? true : exists;
    },
    undefined
  );

  if (drawDefinitionExists) {
    return { error: DRAW_ID_EXISTS };
  } else {
    const drawOrders = event.drawDefinitions
      .map(({ drawOrder }) => !isNaN(drawOrder) && parseInt(drawOrder))
      .sort((a, b) => a - b);

    const nextDrawOrder = Math.max(0, ...drawOrders.filter((f) => f)) + 1;
    let drawOrder = nextDrawOrder;

    const { flightProfile } = getFlightProfile({ event });
    const flight = flightProfile?.flights?.find(
      (flight) => flight.drawId === drawDefinition.drawId
    );

    if (flight) {
      // if this drawId was defined in a flightProfile...
      // ...update the flight.drawName with the drawName in the drawDefinition
      flight.drawName = drawDefinition.drawName;
      const extension = {
        name: FLIGHT_PROFILE,
        value: {
          ...flightProfile,
          flights: flightProfile.flights,
        },
      };

      const flightNumber = flight.flightNumber;
      if (flightNumber && !drawOrders.includes(flightNumber)) {
        drawOrder = flightNumber;
      }

      addEventExtension({ event, extension });
    }

    Object.assign(drawDefinition, { drawOrder });
    event.drawDefinitions.push(drawDefinition);
  }

  const { matchUps } = allDrawMatchUps({ drawDefinition, event });
  addNotice({ topic: 'addMatchUps', payload: { matchUps } });

  return SUCCESS;
}
