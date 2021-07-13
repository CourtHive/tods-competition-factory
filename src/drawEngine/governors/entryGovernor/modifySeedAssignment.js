import { getStructureSeedAssignments } from '../../getters/getStructureSeedAssignments';
import { findStructure } from '../../getters/findStructure';

import { SUCCESS } from '../../../constants/resultConstants';
import {
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
  drawDefinition,
  participantId,
  structureId,
  seedValue,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };
  const { structure } = findStructure({ drawDefinition, structureId });
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  const { seedAssignments } = getStructureSeedAssignments({
    drawDefinition,
    structure,
  });
  const seedNumbers = seedAssignments.map(
    (assignment) => assignment.seedNumber
  );

  const existingAssginment = seedAssignments.find(
    (assignment) => assignment.participantId === participantId
  );

  if (existingAssginment) {
    existingAssginment.seedValue = seedValue;
  } else {
    const seedNumber = Math.max(0, ...seedNumbers) + 1;
    structure.seedAssignments.push({ seedNumber, seedValue, participantId });
  }

  return SUCCESS;
}
