import { decorateResult } from '../../functions/global/decorateResult';
import { addEventExtension } from '../extensions/addRemoveExtensions';
import { getParticipantId } from '../../functions/global/extractors';
import { getFlightProfile } from '../../query/event/getFlightProfile';
import { intersection } from '../../tools/arrays';
import { ensureInt } from '../../tools/ensureInt';
import { UUID } from '../../tools/UUID';

import { EXISTING_FLIGHT, INVALID_VALUES, MISSING_EVENT, MISSING_VALUE } from '../../constants/errorConditionConstants';
import { FLIGHT_PROFILE } from '../../constants/extensionConstants';
import { Entry, Event } from '../../types/tournamentTypes';

type AddFlightArgs = {
  qualifyingPositions?: number;
  drawEntries?: Entry[];
  drawName?: string;
  drawId: string;
  stage?: string;
  event: Event;
};
export function addFlight({
  qualifyingPositions,
  drawEntries = [], // [{ entryPosition, entryStatus, participantId }]
  drawName,
  drawId,
  event,
  stage,
}: AddFlightArgs) {
  const stack = 'addFlight';
  if (!event) return decorateResult({ result: { error: MISSING_EVENT }, stack });
  if (!drawName) return decorateResult({ result: { error: MISSING_VALUE }, stack });

  if (drawEntries?.length) {
    // check that all drawEntries are in event.entries
    const enteredParticipantIds = (event.entries ?? []).map(getParticipantId);
    const flightParticipantIds = drawEntries.map(getParticipantId);
    if (intersection(flightParticipantIds, enteredParticipantIds).length !== flightParticipantIds.length) {
      return decorateResult({ result: { error: INVALID_VALUES }, stack });
    }
  }

  const flightProfile = getFlightProfile({ event })?.flightProfile;

  const flightNumbers =
    flightProfile?.flights
      ?.map(({ flightNumber }) => !isNaN(flightNumber) && ensureInt(flightNumber))
      ?.filter(Boolean) || [];

  const flightNumber = Math.max(0, ...flightNumbers) + 1;

  const flightDrawId = drawId || UUID();
  const flight: any = {
    drawId: flightDrawId,
    flightNumber,
    drawEntries,
    drawName,
  };

  if (stage) flight.stage = stage;
  if (qualifyingPositions) flight.qualifyingPositions = qualifyingPositions;

  const flightExists = (flightProfile?.flights || []).find(({ drawId }) => drawId === flight.drawId);
  if (flightExists) return decorateResult({ result: { error: EXISTING_FLIGHT }, stack });

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
