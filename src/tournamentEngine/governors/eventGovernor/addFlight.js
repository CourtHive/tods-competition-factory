import { addEventExtension } from '../tournamentGovernor/addRemoveExtensions';
import { decorateResult } from '../../../global/functions/decorateResult';
import { getParticipantIds } from '../../../global/functions/extractors';
import { getFlightProfile } from '../../getters/getFlightProfile';
import { intersection, UUID } from '../../../utilities';

import { FLIGHT_PROFILE } from '../../../constants/extensionConstants';
import {
  EXISTING_FLIGHT,
  INVALID_VALUES,
  MISSING_EVENT,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

/**
 *
 * @param {number} qualifyingPositions - optional - number of positions in draw to be reserved for qualifiers
 * @param {object[]} drawEntries - [{ entryPosition, entryStatus, participantId }]
 * @param {number} matchUpValue - point value of each matchUp (for team scoring)
 * @param {number} drawName - name to be applied to draw generated from profile
 * @param {string} drawId - optional - will be generated if not supplied
 * @param {object} event - event to which fligh is being added
 * @param {string} stage - stage of the draw that will be generated from profile
 * @returns
 */
export function addFlight({
  qualifyingPositions,
  drawEntries = [],
  matchUpValue,
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
        ({ flightNumber }) => !isNaN(flightNumber) && parseInt(flightNumber)
      )
      ?.filter(Boolean) || [];

  const flightNumber = Math.max(0, ...flightNumbers) + 1;

  const flightDrawId = drawId || UUID();
  const flight = {
    drawId: flightDrawId,
    flightNumber,
    matchUpValue,
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
