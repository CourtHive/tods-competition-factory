import { findStructure } from '../../getters/findStructure';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { generateRange } from '../../../utilities';

import {
  MISSING_STRUCTURE,
  SEEDSCOUNT_GREATER_THAN_DRAW_SIZE,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function initializeStructureSeedAssignments({
  drawDefinition,
  structureId,
  seedsCount,
}) {
  const { structure } = findStructure({ drawDefinition, structureId });
  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const drawSize = positionAssignments.length;
  if (!structure) return { error: MISSING_STRUCTURE };
  if (seedsCount > drawSize)
    return { error: SEEDSCOUNT_GREATER_THAN_DRAW_SIZE };

  structure.seedLimit = seedsCount;
  structure.seedAssignments = generateRange(1, seedsCount + 1).map(
    (seedNumber) => ({
      seedNumber,
      seedValue: seedNumber,
      participantId: undefined,
    })
  );

  return SUCCESS;
}
