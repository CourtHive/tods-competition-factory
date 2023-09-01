import { getAllStructureMatchUps } from './getAllStructureMatchUps';
import { findStructure } from '../findStructure';
import {
  RoundMatchUpsResult,
  getRoundMatchUps,
} from '../../accessors/matchUpAccessor/getRoundMatchUps';

export function getStructureRoundProfile({
  drawDefinition,
  structureId,
}): RoundMatchUpsResult {
  const result = findStructure({
    drawDefinition,
    structureId,
  });
  if (result.error) return result;

  // DEV-NOTE cannot pass drawDefinition parameter in this scenario; callstack error
  const { matchUps } = getAllStructureMatchUps({ structure: result.structure });
  return getRoundMatchUps({ matchUps });
}
