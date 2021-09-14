import { getEliminationDrawSize } from '../../../drawEngine/getters/getEliminationDrawSize';
import { getStageEntries } from '../../getters/participants/getStageEntries';
import { getSeedsCount } from './getSeedsCount';

import { MISSING_EVENT } from '../../../constants/errorConditionConstants';

/**
 *
 * @param {string} eventId - resolved by tournamentEngine to the event object
 *
 * @param {object} policyDefinitions - seeding policyDefinitions determines the # of seeds for given participantCount/drawSize
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

  policyDefinitions,
  drawSize,
  stage,
}) {
  if (!event) return { error: MISSING_EVENT };

  const { entries, stageEntries } = getStageEntries({
    event,
    stage,
    drawDefinition,
    drawId,
  });
  /*
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
  */
  const participantCount = stageEntries.length;

  const { drawSize: eliminationDrawSize } = getEliminationDrawSize({
    participantCount,
  });
  const { seedsCount, error } = getSeedsCount({
    policyDefinitions,
    participantCount,
    drawSize: drawSize || eliminationDrawSize,
  });
  if (error) return { error };

  return { entries, seedsCount, stageEntries };
}
