import { getStructureGroups } from '../../../query/structure/getStructureGroups';

import { SUCCESS } from '@Constants/resultConstants';

export function resequenceStructures({ drawDefinition }) {
  const { maxQualifyingDepth, structureProfiles } = getStructureGroups({
    drawDefinition,
  });

  for (const structure of drawDefinition.structures) {
    const profile = structureProfiles[structure.structureId];
    if (profile.distanceFromMain) {
      structure.stageSequence = maxQualifyingDepth + 1 - profile.distanceFromMain;
    }
  }

  return { ...SUCCESS };
}
