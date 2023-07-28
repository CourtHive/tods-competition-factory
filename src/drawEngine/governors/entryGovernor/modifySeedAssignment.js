import { getStructureSeedAssignments } from '../../getters/getStructureSeedAssignments';
import { modifySeedAssignmentsNotice } from '../../notifications/drawNotifications';
import { findStructure } from '../../getters/findStructure';
import { isNumeric } from '../../../utilities/math';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

/**
 * method is made available to clients via positionActions
 * modifies the seedValue of an existing seedAssignment for a given participantId
 * --or-- adds an additional seedAssignment for an unrecognized participantId (this behavior may be unnecessary)
 *
 * @param {object} drawDefinition
 * @param {string} participantId
 * @param {string} structureId
 * @param {string} seedValue
 *
 */
export function modifySeedAssignment({
  validation = true,
  tournamentRecord,
  drawDefinition,
  participantId,
  structureId,
  seedValue,
  event,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };

  const { structure } = findStructure({ drawDefinition, structureId });
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  const validValue =
    !validation ||
    isNumeric(seedValue) ||
    [undefined, ''].includes(seedValue) ||
    (typeof seedValue === 'string' &&
      seedValue.split('-').every((v) => isNumeric(v) && v > 0));

  if (!validValue) return { error: INVALID_VALUES };

  const { seedAssignments } = getStructureSeedAssignments({
    drawDefinition,
    structure,
    event,
  });
  const seedNumbers = seedAssignments.map(
    (assignment) => assignment.seedNumber
  );

  const existingAssginment = seedAssignments.find(
    (assignment) => assignment.participantId === participantId
  );

  if (existingAssginment) {
    const newValue =
      typeof seedValue === 'string'
        ? (seedValue.includes('-') &&
            seedValue
              .split('-')
              .map((v) => parseInt(v))
              .join('-')) ||
          (seedValue > 0 && parseInt(seedValue)) ||
          ''
        : (seedValue > 0 && parseInt(seedValue)) || '';
    existingAssginment.seedValue = newValue;
  } else {
    const seedNumber = Math.max(0, ...seedNumbers) + 1;
    structure.seedAssignments.push({ seedNumber, seedValue, participantId });
  }

  modifySeedAssignmentsNotice({
    tournamentId: tournamentRecord?.tournamentId,
    structureIds: [structureId],
    eventId: event?.eventId,
    drawDefinition,
    structure,
  });

  return { ...SUCCESS };
}
