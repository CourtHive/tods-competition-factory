import { addEventExtension } from '../tournamentGovernor/addRemoveExtensions';
import { decorateResult } from '../../../global/functions/decorateResult';
import { getParticipantIds } from '../../../global/functions/extractors';
import { getFlightProfile } from '../../getters/getFlightProfile';
import { ensureInt } from '../../../utilities/ensureInt';
import { intersection, UUID } from '../../../utilities';

import { FLIGHT_PROFILE } from '../../../constants/extensionConstants';
import {
  EXISTING_FLIGHT,
  INVALID_VALUES,
  MISSING_EVENT,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function addFlight({
  qualifyingPositions,
  drawEntries = [], // [{ entryPosition, entryStatus, participantId }]
  drawName,
  drawId,
  event,
  stage,
}) {
  const stack = 'addFlight';
  if (!event)
    return decorateResult({ result: { error: MISSING_EVENT }, stack });
  if (!drawName)
    return decorateResult({ result: { error: MISSING_VALUE }, stack });

  if (drawEntries?.length) {
    // check that all drawEntries are in event.entries
    const enteredParticipantIds = getParticipantIds(event.entries || []);
    const flightParticipantIds = getParticipantIds(drawEntries);
    if (
      intersection(flightParticipantIds, enteredParticipantIds).length !==
      flightParticipantIds.length
    ) {
      return decorateResult({ result: { error: INVALID_VALUES }, stack });
    }
  }

  const flightProfile = getFlightProfile({ event })?.flightProfile;

  const flightNumbers =
    flightProfile?.flights
      ?.map(
        ({ flightNumber }) => !isNaN(flightNumber) && ensureInt(flightNumber)
      )
      ?.filter(Boolean) || [];

  const flightNumber = Math.max(0, ...flightNumbers) + 1;

  const flightDrawId = drawId || UUID();
  const flight = {
    drawId: flightDrawId,
    flightNumber,
    drawEntries,
    drawName,
  };

  if (stage) flight.stage = stage;
  if (qualifyingPositions) flight.qualifyingPositions = qualifyingPositions;

  const flightExists = (flightProfile?.flights || []).find(
    ({ drawId }) => drawId === flight.drawId
  );
  if (flightExists)
    return decorateResult({ result: { error: EXISTING_FLIGHT }, stack });

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
