import { getRoundMatchUps } from '../../accessors/matchUpAccessor/matchUps';
import { getAllStructureMatchUps } from './getAllStructureMatchUps';
import { findStructure } from '../findStructure';

export function getStructureRoundProfile({ drawDefinition, structureId }) {
  const { structure } = findStructure({
    drawDefinition,
    structureId,
  });

  // NOTE: cannot pass drawDefinition parameter in this scenario; callstack error
  const { matchUps } = getAllStructureMatchUps({
    inContext: true,
    structure,
  });
  return getRoundMatchUps({ matchUps });
}
