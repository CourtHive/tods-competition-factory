import { getAffectedTargetStructureIds } from './getAffectedTargetStructureIds';
import { isCompletedStructure } from '../queryGovernor/structureActions';
import { getDevContext } from '../../../global/globalState';

import { WIN_RATIO } from '../../../constants/drawDefinitionConstants';

/**
 * check effect of winningSide change in a structure where progression is based on WIN_RATIO
 * For ROUND_ROBIN_WITH_PLAYOFF the movement of participants into different structures
 * will be changed and IF no matchUps are active in either structure then participants can be swapped
 */
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
        if (getDevContext()) console.log('affects:', { structureIds });
      }
      return structureIds;
    }
  }
}
