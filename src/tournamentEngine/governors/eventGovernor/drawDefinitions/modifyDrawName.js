import { addEventExtension } from '../../tournamentGovernor/addRemoveExtensions';
import { getFlightProfile } from '../../../getters/getFlightProfile';

import {
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
} from '../../../../constants/errorConditionConstants';
import { FLIGHT_PROFILE } from '../../../../constants/extensionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

export function modifyDrawName({ event, drawId, drawDefinition, drawName }) {
  if (!drawName || typeof drawName !== 'string')
    return { error: INVALID_VALUES, drawName };

  const { flightProfile } = getFlightProfile({ event });
  const flight = flightProfile?.flights?.find(
    (flight) => flight.drawId === drawId
  );

  if (flight) {
    flight.drawName = drawName;
    const extension = {
      name: FLIGHT_PROFILE,
      value: {
        ...flightProfile,
        flights: flightProfile.flights,
      },
    };

    addEventExtension({ event, extension });
  }

  if (drawDefinition) {
    drawDefinition.drawName = drawName;
  }

  if (!flight && !drawDefinition) {
    return { error: MISSING_DRAW_DEFINITION };
  }

  return SUCCESS;
}
