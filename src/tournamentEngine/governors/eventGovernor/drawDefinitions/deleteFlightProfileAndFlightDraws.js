import { removeEventExtension } from '../../tournamentGovernor/addRemoveExtensions';
import { getFlightProfile } from '../../../getters/getFlightProfile';
import { deleteDrawDefinitions } from './deleteDrawDefinitions';

import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';
import { FLIGHT_PROFILE } from '../../../../constants/extensionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

export function deleteFlightProfileAndFlightDraws({ tournamentRecord, event }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const { flightProfile } = getFlightProfile({ event });

  if (flightProfile) {
    const drawIds = flightProfile.flights
      ?.map(({ drawId }) => drawId)
      .filter((f) => f);
    const result = deleteDrawDefinitions({
      tournamentRecord,
      eventId: event.eventId,
      drawIds,
    });
    if (result.error) return result;

    return removeEventExtension({ event, name: FLIGHT_PROFILE });
  }

  return SUCCESS;
}
