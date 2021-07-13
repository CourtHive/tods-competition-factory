import { structureAssignedDrawPositions } from '../../../getters/positionsGetter';
import { getNextSeedBlock } from '../../../getters/seedGetter';
import { findStructure } from '../../../getters/findStructure';

import {
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
  STRUCTURE_NOT_FOUND,
} from '../../../../constants/errorConditionConstants';

export function getNextUnfilledDrawPositions({ drawDefinition, structureId }) {
  if (!drawDefinition) {
    const error = MISSING_DRAW_DEFINITION;
    return { error, nextUnfilledDrawPositions: [] };
  }
  if (!structureId) {
    const error = MISSING_STRUCTURE_ID;
    return { error, nextUnfilledDrawPositions: [] };
  }

  const { structure, error } = findStructure({ drawDefinition, structureId });

  if (error) return { error };
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  const result = structureAssignedDrawPositions({ structure });
  const positionAssignments = result?.positionAssignments || [];
  const { unfilledPositions } = getNextSeedBlock({
    drawDefinition,
    structureId,
    randomize: true,
  });

  const unfilledDrawPositions = positionAssignments
    .filter((assignment) => {
      return (
        !assignment.participantId && !assignment.bye && !assignment.qualifier
      );
    })
    .map((assignment) => assignment.drawPosition);

  if (unfilledPositions?.length) {
    return { nextUnfilledDrawPositions: unfilledPositions };
  } else {
    return { nextUnfilledDrawPositions: unfilledDrawPositions };
  }
}
