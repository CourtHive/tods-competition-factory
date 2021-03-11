import { getEntriesAndSeedsCount } from '../../policyGovernor/getEntriesAndSeedsCount';
import { getScaledEntries } from './getScaledEntries';

import { SEEDING } from '../../../../constants/scaleConstants';

/**
 *
 * @param {object} tournamentRecord - passed automatically if tournamentEngine.setState() has been called
 * @param {string} eventId - resolved by tournamentEngine to the event object
 *
 * @param {object} policyDefinition - seeding policyDefinition determines the # of seeds for given participantCount/drawSize
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

  policyDefinition,
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
    policyDefinition,
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

  const seededEntries = Object.assign(
    {},
    ...(scaledEntries || [])
      .slice(0, seedsCount)
      .map(({ participantId }, index) => ({ [participantId]: index + 1 }))
  );

  scaleName = scaleName || scaleAttributes.scaleName;
  const scaleDate = new Date().toISOString();

  const scaleItemsWithParticipantIds = stageEntries.map(({ participantId }) => {
    const scaleItem = {
      scaleValue: seededEntries[participantId],
      eventType: scaleAttributes.eventType,
      scaleType: SEEDING,
      scaleName,
      scaleDate,
    };
    return {
      participantId,
      scaleItems: [scaleItem],
    };
  });

  return { scaleItemsWithParticipantIds };
}
