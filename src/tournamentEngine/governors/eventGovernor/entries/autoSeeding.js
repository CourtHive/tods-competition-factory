import { getEliminationDrawSize } from '../../../../drawEngine/getters/getEliminationDrawSize';
import { setParticipantScaleItems } from '../../participantGovernor/scaleItems';
import { getFlightProfile } from '../../../getters/getFlightProfile';
import { getSeedsCount } from '../../policyGovernor/getSeedsCount';
import { getDevContext } from '../../../../global/globalState';
import { getScaledEntries } from './getScaledEntries';

import { MISSING_EVENT } from '../../../../constants/errorConditionConstants';
import { STRUCTURE_ENTERED_TYPES } from '../../../../constants/entryStatusConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
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

  const result = setParticipantScaleItems({
    tournamentRecord,
    scaleItemsWithParticipantIds,
  });
  if (result.error) return result;

  return getDevContext()
    ? Object.assign({}, SUCCESS, { scaleItemsWithParticipantIds })
    : SUCCESS;
}
