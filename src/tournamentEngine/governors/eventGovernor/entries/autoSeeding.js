import { getEntriesAndSeedsCount } from '../../policyGovernor/getEntriesAndSeedsCount';
import { generateSeedingScaleItems } from './generateSeedingScaleItems';
import { getScaledEntries } from './getScaledEntries';

/**
 *
 * @param {object} tournamentRecord - passed automatically if tournamentEngine.setState() has been called
 * @param {string} eventId - resolved by tournamentEngine to the event object
 *
 * @param {object} policyDefinitions - seeding policyDefinitions determines the # of seeds for given participantCount/drawSize
 * @param {object} scaleAttributes -
 * @param {string} scaleName - OPTIONAL - defaults to scaleAttributes.scaleName
 * @param {number} drawSize - OPTIONAL - defaults to calculation based on # of entries
 * @param {string} drawId - OPTIONAL - will use flight.drawEntries or drawDefinition.entries rather than event.entries
 * @param {string} stage - OPTIONAL - filters entries by specified stage
 *
 * @param {boolean} sortDescending - OPTIONAL - defaults to false
 * @param {function} scaleSortMethod - OPTIONAL - user defined sorting method
 *
 * @returns {object} - { success: true } or { error }
 */
export function autoSeeding({
  tournamentRecord,
  drawDefinition,

  policyDefinitions,
  scaleAttributes,
  scaleName,
  drawSize,
  drawId,
  event,
  stage,

  sortDescending,
  scaleSortMethod,
}) {
  const { error, entries, seedsCount, stageEntries } = getEntriesAndSeedsCount({
    drawDefinition,
    drawId,
    event,
    policyDefinitions,
    drawSize,
    stage,
  });

  if (error) return { error };

  const { scaledEntries } = getScaledEntries({
    scaleAttributes,
    tournamentRecord,
    scaleSortMethod,
    sortDescending,
    entries,
    stage,
  });

  const { scaleItemsWithParticipantIds } = generateSeedingScaleItems({
    scaledEntries,
    seedsCount,
    scaleAttributes,
    scaleName,
    stageEntries,
  });

  return { scaleItemsWithParticipantIds };
}
