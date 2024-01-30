import { removeParticipantsScaleItems } from '../participants/removeScaleItems';
import { decorateResult } from '../../functions/global/decorateResult';
import { getParticipantId } from '../../functions/global/extractors';
import { mustBeAnArray } from '@Tools/mustBeAnArray';
import { getFlightProfile } from '@Query/event/getFlightProfile';

import { INVALID_VALUES, MISSING_EVENT } from '@Constants/errorConditionConstants';

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
  scaleAttributes,
  drawDefinition,
  entryStatuses,
  drawId,
  event,
  stage,
}) {
  if (!event) return { error: MISSING_EVENT };
  if (entryStatuses && !Array.isArray(entryStatuses))
    return decorateResult({
      result: { error: INVALID_VALUES },
      info: mustBeAnArray('entryStatus'),
      stack: 'removeScaleValues',
    });

  let entries = event.entries;

  if (drawId) {
    const { flightProfile } = getFlightProfile({ event });
    const flight = flightProfile?.flights?.find((flight) => flight.drawId === drawId);
    if (flight) {
      entries = flight.drawEntries;
    } else {
      entries = drawDefinition?.entries;
    }
  }

  const stageEntries = (entries || []).filter(
    (entry) =>
      (!stage || !entry.entryStage || entry.entryStage === stage) &&
      (!entryStatuses || entryStatuses.includes(entry.entryStatus)),
  );

  const participantIds = stageEntries.map(getParticipantId);

  return removeParticipantsScaleItems({
    tournamentRecord,
    scaleAttributes,
    participantIds,
  });
}
