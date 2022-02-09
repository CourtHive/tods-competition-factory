import { addEventExtension } from '../tournamentGovernor/addRemoveExtensions';
import { getParticipantIds } from '../../../global/functions/extractors';
import { getFlightProfile } from '../../getters/getFlightProfile';
import { intersection, UUID } from '../../../utilities';

import { FLIGHT_PROFILE } from '../../../constants/extensionConstants';
import {
  EXISTING_FLIGHT,
  INVALID_VALUES,
  MISSING_DRAW_ID,
  MISSING_EVENT,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';
import {
  LOSER,
  VOLUNTARY_CONSOLATION,
} from '../../../constants/drawDefinitionConstants';

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
  sourceDrawId,
  drawName,
  drawId,
  event,
  stage,
}) {
  if (!event) return { error: MISSING_EVENT };
  if (!drawName) return { error: MISSING_VALUE };

  if (drawEntries?.length) {
    // check that all drawEntries are in event.entries
    const enteredParticipantIds = getParticipantIds(event.entries || []);
    const flightParticipantIds = getParticipantIds(drawEntries);
    if (
      intersection(flightParticipantIds, enteredParticipantIds).length !==
      flightParticipantIds.length
    ) {
      return { error: INVALID_VALUES };
    }
  }

  const flightProfile = getFlightProfile({ event })?.flightProfile;

  // VOLUNTARY_CONSOLATION stage requires a link be established from source draw
  if (stage === VOLUNTARY_CONSOLATION && !sourceDrawId)
    return { error: MISSING_VALUE };

  // sourceDrawId must exist in flightProfile
  if (
    sourceDrawId &&
    !flightProfile?.flights?.find(({ drawId }) => drawId === sourceDrawId)
  )
    return { error: MISSING_DRAW_ID };

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
  if (flightExists) return { error: EXISTING_FLIGHT };

  const flights = (flightProfile?.flights || []).concat(flight);

  const extension = {
    name: FLIGHT_PROFILE,
    value: {
      ...(flightProfile || {}),
      flights,
    },
  };

  if (sourceDrawId) {
    // if there is a sourceDrawId construct a link
    const links = flightProfile?.links || [];

    if (stage === VOLUNTARY_CONSOLATION) {
      links.push({
        linkType: LOSER,
        source: { drawId: sourceDrawId },
        target: { drawId: flightDrawId },
      });
    }

    extension.value.links = links;
  }

  return addEventExtension({ event, extension });
}
