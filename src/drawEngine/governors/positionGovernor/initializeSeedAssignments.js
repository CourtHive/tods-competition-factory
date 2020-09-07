import { generateRange } from 'competitionFactory/utilities';
import { findStructure } from 'competitionFactory/drawEngine/getters/structureGetter';
import { structureAssignedDrawPositions } from 'competitionFactory/drawEngine/getters/positionsGetter';

import { SUCCESS } from 'competitionFactory/constants/resultConstants';

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

