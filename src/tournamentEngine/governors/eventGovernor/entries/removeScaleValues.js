import { removeParticipantsScaleItems } from '../../participantGovernor/removeScaleItems';
import { getFlightProfile } from '../../../getters/getFlightProfile';

import { MISSING_EVENT } from '../../../../constants/errorConditionConstants';
import { STRUCTURE_ENTERED_TYPES } from '../../../../constants/entryStatusConstants';

/**
 *
 * @param {object} tournamentRecord - passed automatically if tournamentEngine.setState()
 * @param {string} eventId - resolves to event
 * @param {string} drawId - OPTIONAL - resolves drawDefinition - scopes participants to clear to drawDefinition.entries or flightProfile.flight.drawEntries
 * @param {string} scaleAttributes - { scaleType, scaleName, eventType }
 * @param {string} stage - OPTIONAL - filter event or draw entries by stage
 * @returns {boolean} { success: true } or { error }
 */
export function removeScaleValues({
  tournamentRecord,
  drawDefinition,

  scaleAttributes,
  drawId,
  event,
  stage,
}) {
  if (!event) return { error: MISSING_EVENT };

  let entries = event.entries;

  if (drawId) {
    const { flightProfile } = getFlightProfile({ event });
    const flight = flightProfile?.flights?.find(
      (flight) => flight.drawId === drawId
    );
    if (flight) {
      entries = flight.drawEntries;
    } else {
      entries = drawDefinition?.entries;
    }
  }

  const stageEntries = entries.filter(
    (entry) =>
      (!stage || !entry.entryStage || entry.entryStage === stage) &&
      STRUCTURE_ENTERED_TYPES.includes(entry.entryStatus)
  );

  const participantIds = stageEntries.map(({ participantId }) => participantId);

  const result = removeParticipantsScaleItems({
    tournamentRecord,
    participantIds,
    scaleAttributes,
  });

  return result;
}
