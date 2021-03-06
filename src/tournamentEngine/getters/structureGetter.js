import { findStructure } from '../../drawEngine/getters/findStructure';
import { PLAY_OFF } from '../../constants/drawDefinitionConstants';
import { MISSING_DRAW_DEFINITION } from '../../constants/errorConditionConstants';

export function getPlayoffStructures({ drawDefinition, structureId }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const { structure } = findStructure({ drawDefinition, structureId });

  const targetStructureIds = (drawDefinition?.links || [])
    .filter((link) => link.source?.structureId === structureId)
    .map((link) => link.target?.structureId);

  const playoffStructures = (drawDefinition?.structures || []).filter(
    (structure) =>
      targetStructureIds.includes(structure.structureId) &&
      structure.stage === PLAY_OFF
  );

  return { playoffStructures, structure };
}
