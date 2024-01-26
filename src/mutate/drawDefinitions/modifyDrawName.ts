import { addEventExtension } from '@Mutate/extensions/addRemoveExtensions';
import { modifyDrawNotice } from '@Mutate/notifications/drawNotifications';
import { decorateResult } from '@Functions/global/decorateResult';
import { getFlightProfile } from '@Query/event/getFlightProfile';

// constants and types
import { INVALID_VALUES, MISSING_DRAW_DEFINITION } from '../../constants/errorConditionConstants';
import { DrawDefinition, Event, Tournament } from '../../types/tournamentTypes';
import { Flight, FlightProfile, ResultType } from '../../types/factoryTypes';
import { FLIGHT_PROFILE } from '../../constants/extensionConstants';
import { SUCCESS } from '../../constants/resultConstants';

type ModifyDrawNameArgs = {
  tournamentRecord: Tournament;
  drawDefinition: DrawDefinition;
  flightProfile: FlightProfile;
  drawName: string;
  drawId: string;
  event: Event;
};
export function modifyDrawName({
  tournamentRecord,
  drawDefinition,
  flightProfile,
  drawName,
  drawId,
  event,
}: ModifyDrawNameArgs): ResultType & { flight?: Flight } {
  if (!drawName || typeof drawName !== 'string')
    return decorateResult({
      result: { error: INVALID_VALUES },
      context: { drawName },
    });

  if (!flightProfile) {
    flightProfile = getFlightProfile({ event }).flightProfile;
  }

  const flight = flightProfile?.flights?.find((flight) => flight.drawId === drawId);

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
    modifyDrawNotice({
      tournamentId: tournamentRecord?.tournamentId,
      drawDefinition,
    });
  }

  if (!flight && !drawDefinition) {
    return { error: MISSING_DRAW_DEFINITION };
  }

  return { ...SUCCESS, flight };
}
