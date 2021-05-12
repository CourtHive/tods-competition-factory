import { addEventExtension } from '../tournamentGovernor/addRemoveExtensions';
import { getFlightProfile } from '../../getters/getFlightProfile';
import { intersection, UUID } from '../../../utilities';

import { FLIGHT_PROFILE } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_EVENT,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function addFlight({
  event,
  stage,
  drawId,
  drawName,
  drawSize,
  drawEntries = [],
  qualifyingPositions,
}) {
  if (!event) return { error: MISSING_EVENT };
  if (!drawName) return { error: MISSING_VALUE };

  if (drawEntries?.length) {
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

  const flightNumbers =
    flightProfile?.flights
      ?.map(
        ({ flightNumber }) => !isNaN(flightNumber) && parseInt(flightNumber)
      )
      ?.filter((f) => f) || [];

  const flightNumber = Math.max(0, ...flightNumbers) + 1;

  const flight = {
    stage,
    drawName,
    drawSize,
    drawEntries,
    flightNumber,
    qualifyingPositions,
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
