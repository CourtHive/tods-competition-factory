import { removeEventExtension } from '../../tournamentGovernor/addRemoveExtensions';
import { getFlightProfile } from '../../../getters/getFlightProfile';
import { deleteDrawDefinitions } from './deleteDrawDefinitions';

import { FLIGHT_PROFILE } from '../../../../constants/extensionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';

export function deleteFlightProfileAndFlightDraws({
  autoPublish = true,
  tournamentRecord,
  auditData,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const { flightProfile } = getFlightProfile({ event });

  if (flightProfile) {
    const drawIds = flightProfile.flights
      ?.map(({ drawId }) => drawId)
      .filter(Boolean);

    const result = deleteDrawDefinitions({
      eventId: event.eventId,
      tournamentRecord,
      autoPublish,
      auditData,
      drawIds,
      event,
    });
    if (result.error) return result;

    return removeEventExtension({ event, name: FLIGHT_PROFILE });
  }

  return { ...SUCCESS };
}
