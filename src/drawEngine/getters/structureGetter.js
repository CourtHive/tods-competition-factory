import { getAllStructureMatchUps } from './getMatchUps/getAllStructureMatchUps';
import { findStructure } from './findStructure';

import { QUALIFYING } from '../../constants/drawDefinitionConstants';

export function getStructureQualifiersCount({
  drawDefinition,
  structureId,
  structure,
}) {
  let error, qualifiersCount;
  if (!structure) {
    ({ structure, error } = findStructure({ drawDefinition, structureId }));
  }
  if (!error) {
    if (structure.stage !== QUALIFYING) {
      error = 'Structure is not Qualifying';
    } else {
      const { matchUps } = getAllStructureMatchUps({
        drawDefinition,
        structure,
      });
      qualifiersCount = matchUps.reduce((count, matchUp) => {
        return count + (matchUp.finishingRound === 1 ? 1 : 0);
      }, 0);
    }
  }
  return { qualifiersCount, error };
}
