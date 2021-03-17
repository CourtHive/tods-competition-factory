import { addEventExtension } from '../tournamentGovernor/addRemoveExtensions';
import { getFlightProfile } from '../../getters/getFlightProfile';
import { intersection, UUID } from '../../../utilities';

import {
  INVALID_VALUES,
  MISSING_EVENT,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';
import { FLIGHT_PROFILE } from '../../../constants/flightConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function addFlight({ event, drawName, drawEntries, drawId }) {
  if (!event) return { error: MISSING_EVENT };
  if (!drawName) return { error: MISSING_VALUE };

  if (drawEntries) {
    // check that all drawEntries are in event.entries
    const enteredParticipantIds =
      event.entries
        ?.map(({ participantId }) => participantId)
        .filter((f) => f) || [];
    const flightParticipantIds = drawEntries
      .map(({ participantId }) => participantId)
      .filter((f) => f);
    if (
      intersection(flightParticipantIds, enteredParticipantIds).length !==
      flightParticipantIds.length
    ) {
      return { error: INVALID_VALUES };
    }
  }

  const { flightProfile } = getFlightProfile({ event });

  const flight = {
    drawName,
    drawEntries,
    drawId: drawId || UUID(),
  };

  const flights = (flightProfile?.flights || []).concat(flight);

  const extension = {
    name: FLIGHT_PROFILE,
    value: {
      ...(flightProfile || {}),
      flights,
    },
  };

  addEventExtension({ event, extension });

  return SUCCESS;
}
