import { getRoundMatchUps } from '../../accessors/matchUpAccessor/matchUps';
import { getAllStructureMatchUps } from './getAllStructureMatchUps';
import { findStructure } from '../findStructure';

export function getStructureRoundProfile({ drawDefinition, structureId }) {
  const { structure } = findStructure({
    drawDefinition,
    structureId,
  });
  const { matchUps } = getAllStructureMatchUps({
    structure,
    inContext: true,
  });
  return getRoundMatchUps({ matchUps });
}
