import { WIN_RATIO } from '../../../constants/drawDefinitionConstants';
import { isCompletedStructure } from '../queryGovernor/structureActions';
import { getAffectedTargetStructureIds } from './getAffectedTargetStructureIds';

export function checkConnectedStructures({
  drawDefinition,
  structure,
  matchUp,
}) {
  // check whether player movement is dependent on win ratio
  if (structure.finishingPosition === WIN_RATIO) {
    const structureIsComplete = isCompletedStructure({
      drawDefinition,
      structure,
    });
    if (structureIsComplete) {
      // if structure is complete then a changed outcome will have downstream effects
      const { structureIds } = getAffectedTargetStructureIds({
        drawDefinition,
        structure,
        matchUp,
      });
      if (structureIds?.length) {
        console.log('affects:', { structureIds });
      }
      return structureIds;
    }
  }
}
