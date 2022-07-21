import { addEventExtension } from '../../tournamentGovernor/addRemoveExtensions';
import { getFlightProfile } from '../../../getters/getFlightProfile';
import { refreshEventDrawOrder } from './refreshEventDrawOrder';
import { deleteDrawDefinitions } from './deleteDrawDefinitions';

import { FLIGHT_PROFILE } from '../../../../constants/extensionConstants';
import {
  MISSING_DRAW_ID,
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';

export function deleteFlightAndFlightDraw({
  tournamentRecord,
  auditData,
  drawId,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawId) return { error: MISSING_DRAW_ID };
  if (!event) return { error: MISSING_EVENT };

  const { flightProfile } = getFlightProfile({ event });

  const dependentDrawIds =
    flightProfile?.links
      ?.filter((link) => link.source?.drawId === drawId)
      ?.map((link) => link.target?.drawId)
      ?.filter(Boolean) || [];

  if (flightProfile) {
    const flight = flightProfile.flights?.find(
      (flight) => flight.drawId === drawId
    );

    if (flight || dependentDrawIds.length) {
      const flights = flightProfile.flights.filter((flight) => {
        const included = dependentDrawIds.includes(flight.drawId);
        return flight.drawId !== drawId && !included;
      });

      const extension = {
        name: FLIGHT_PROFILE,
        value: {
          ...flightProfile,
          flights,
        },
      };

      // TODO: this cleanup is not iterative
      if (dependentDrawIds.length && flightProfile.links) {
        const links = flightProfile.links.filter(
          (link) => !dependentDrawIds.includes(link.target?.drawId)
        );
        extension.value.links = links;
      }

      addEventExtension({ event, extension });
    }
  }

  deleteDrawDefinitions({
    drawIds: [drawId, ...dependentDrawIds],
    eventId: event.eventId,
    tournamentRecord,
    auditData,
    event,
  });

  return refreshEventDrawOrder({ tournamentRecord, event });
}
