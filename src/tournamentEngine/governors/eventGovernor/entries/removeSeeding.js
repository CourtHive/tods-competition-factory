import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';
import { SEEDING } from '../../../../constants/scaleConstants';
import { removeScaleValues } from './removeScaleValues';

/**
 *
 * @param {object} tournamentRecord - passed automatically if tournamentEngine.setState()
 * @param {string} eventId - resolves to event
 * @param {string} drawId - OPTIONAL - resolves drawDefinition - scopes participants to clear to drawDefinition.entries or flightProfile.flight.drawEntries
 * @param {string} scaleName - OPTIONAL - defaults to event.categoryName || event.ageCategoryCode
 * @param {string} stage - OPTIONAL - filter event or draw entries by stage
 * @returns {boolean} { success: true } or { error }
 */
export function removeSeeding({
  tournamentRecord,
  drawDefinition,
  scaleName,
  drawId,
  event,
  stage,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  scaleName =
    scaleName ||
    event.category?.categoryName ||
    event.category?.ageCategoryCode;

  const scaleAttributes = {
    eventType: event.eventType,
    scaleType: SEEDING,
    scaleName,
  };

  return removeScaleValues({
    tournamentRecord,
    scaleAttributes,
    drawDefinition,
    drawId,
    event,
    stage,
  });
}
