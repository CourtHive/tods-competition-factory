import { addEventExtension } from '../../tournamentGovernor/addRemoveExtensions';
import { getFlightProfile } from '../../../getters/getFlightProfile';
import { allDrawMatchUps } from '../../../getters/matchUpsGetter';
import { addNotice } from '../../../../global/globalState';
import { findEvent } from '../../../getters/eventGetter';

import { SUCCESS } from '../../../../constants/resultConstants';
import { DRAW_ID_EXISTS } from '../../../../constants/errorConditionConstants';
import { FLIGHT_PROFILE } from '../../../../constants/flightConstants';

export function addDrawDefinition({
  tournamentRecord,
  eventId,
  drawDefinition,
}) {
  const { event } = findEvent({ tournamentRecord, eventId });

  if (event) {
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
      const { flightProfile } = getFlightProfile({ eventId });
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
            flights: flightProfile.flights,
          },
        };

        addEventExtension({ event, extension });
      }
      event.drawDefinitions.push(drawDefinition);
    }
  }

  const { matchUps } = allDrawMatchUps({ drawDefinition, event });
  addNotice({ topic: 'addMatchUps', payload: { matchUps } });

  return SUCCESS;
}
