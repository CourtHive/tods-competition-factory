import { getEntriesAndSeedsCount } from '../../policyGovernor/getEntriesAndSeedsCount';
import { generateSeedingScaleItems } from './generateSeedingScaleItems';
import { getScaledEntries } from './getScaledEntries';

import { INVALID_VALUES } from '../../../../constants/errorConditionConstants';

/**
 *
 * @param {object} tournamentRecord - passed automatically if tournamentEngine.setState() has been called
 * @param {string} eventId - resolved by tournamentEngine to the event object
 *
 * @param {object} policyDefinitions - seeding policyDefinitions determines the # of seeds for given participantsCount/drawSize
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
  const result = getEntriesAndSeedsCount({
    policyDefinitions,
    drawDefinition,
    drawSize,
    drawId,
    event,
    stage,
  });

  if (result.error) return result;

  const { entries, seedsCount, stageEntries } = result;
  if (!stageEntries || !seedsCount) return { error: INVALID_VALUES };

  const scaledEntries =
    getScaledEntries({
      tournamentRecord,
      scaleAttributes,
      scaleSortMethod,
      sortDescending,
      entries,
      stage,
    }).scaledEntries ?? [];

  const { scaleItemsWithParticipantIds } = generateSeedingScaleItems({
    scaleAttributes,
    scaledEntries,
    stageEntries,
    seedsCount,
    scaleName,
  });

  return { scaleItemsWithParticipantIds };
}
