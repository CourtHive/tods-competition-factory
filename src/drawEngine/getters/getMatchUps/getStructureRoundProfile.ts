import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { getAllStructureMatchUps } from './getAllStructureMatchUps';
import { findStructure } from '../findStructure';

export function getStructureRoundProfile({ drawDefinition, structureId }) {
  const result = findStructure({
    drawDefinition,
    structureId,
  });
  if (result.error) return result;

  // DEV-NOTE cannot pass drawDefinition parameter in this scenario; callstack error
  const { matchUps } = getAllStructureMatchUps({ structure: result.structure });
  return getRoundMatchUps({ matchUps });
}
