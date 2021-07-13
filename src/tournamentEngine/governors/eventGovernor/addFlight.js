import { addEventExtension } from '../tournamentGovernor/addRemoveExtensions';
import { getFlightProfile } from '../../getters/getFlightProfile';
import { intersection, UUID } from '../../../utilities';

import { FLIGHT_PROFILE } from '../../../constants/extensionConstants';
import {
  EXISTING_FLIGHT,
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
        .filter(Boolean) || [];
    const flightParticipantIds = drawEntries
      .map(({ participantId }) => participantId)
      .filter(Boolean);
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
      ?.filter(Boolean) || [];

  const flightNumber = Math.max(0, ...flightNumbers) + 1;

  const flight = {
    drawName,
    drawEntries,
    flightNumber,
    drawId: drawId || UUID(),
  };

  if (stage) flight.drawSize = stage;
  if (drawSize) flight.drawSize = drawSize;
  if (qualifyingPositions) flight.qualifyingPositions = qualifyingPositions;

  const flightExists = (flightProfile?.flights || []).find(
    ({ drawId }) => drawId === flight.drawId
  );
  if (flightExists) return { error: EXISTING_FLIGHT };

  const flights = (flightProfile?.flights || []).concat(flight);

  const extension = {
    name: FLIGHT_PROFILE,
    value: {
      ...(flightProfile || {}),
      flights,
    },
  };

  return addEventExtension({ event, extension });
}
