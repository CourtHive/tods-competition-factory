import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { getAllStructureMatchUps } from './getAllStructureMatchUps';
import { findStructure } from '../findStructure';

export function getStructureRoundProfile({ drawDefinition, structureId }) {
  const { structure, error } = findStructure({
    drawDefinition,
    structureId,
  });
  if (error) return { error };

  // DEV-NOTE cannot pass drawDefinition parameter in this scenario; callstack error
  const { matchUps } = getAllStructureMatchUps({
    structure,
  });
  return getRoundMatchUps({ matchUps });
}
