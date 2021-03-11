import { getEliminationDrawSize } from '../../../drawEngine/getters/getEliminationDrawSize';
import { getFlightProfile } from '../../getters/getFlightProfile';
import { getSeedsCount } from './getSeedsCount';

import { STRUCTURE_ENTERED_TYPES } from '../../../constants/entryStatusConstants';
import { MISSING_EVENT } from '../../../constants/errorConditionConstants';

/**
 *
 * @param {string} eventId - resolved by tournamentEngine to the event object
 *
 * @param {object} policyDefinition - seeding policyDefinition determines the # of seeds for given participantCount/drawSize
 * @param {number} drawSize - OPTIONAL - defaults to calculation based on # of entries
 * @param {string} drawId - OPTIONAL - will use flight.drawEntries or drawDefinition.entries rather than event.entries
 * @param {string} stage - OPTIONAL - filters entries by specified stage
 *
 * @returns {object} - { entries, seedsCount, stageEntries } or { error }
 */
export function getEntriesAndSeedsCount({
  drawDefinition,
  drawId,
  event,

  policyDefinition,
  drawSize,
  stage,
}) {
  if (!event) return { error: MISSING_EVENT };

  let entries = event.entries;

  if (drawId) {
    const { flightProfile } = getFlightProfile({ event });
    const flight = flightProfile?.find((flight) => flight.drawId === drawId);
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
  const participantCount = stageEntries.length;

  const { seedsCount, error } = getSeedsCount({
    policyDefinition,
    participantCount,
    drawSize: drawSize || getEliminationDrawSize({ participantCount }),
  });
  if (error) return { error };

  return { entries, seedsCount, stageEntries };
}
