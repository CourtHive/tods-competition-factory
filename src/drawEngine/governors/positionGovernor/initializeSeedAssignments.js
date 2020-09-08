import { findStructure } from '../../getters/structureGetter';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';

import { generateRange } from '../../../utilities';
import { SUCCESS } from '../../../constants/resultConstants';

export function initializeStructureSeedAssignments({drawDefinition, structureId, seedsCount}) {
  const { structure } = findStructure({ drawDefinition, structureId });
  const { positionAssignments } = structureAssignedDrawPositions({structure});
  const drawSize = positionAssignments.length;
  if (!structure) return { error: 'Missing Structure' };
  if (seedsCount > drawSize) return { error: 'Cannot set seedsCount to be greater than drawSize' };
 
  structure.seedLimit = seedsCount;
  structure.seedAssignments = generateRange(1, seedsCount + 1)
    .map(seedNumber => ({ seedNumber, seedValue: seedNumber, participantId: undefined }));

  return SUCCESS;
}

