import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import {
  addMatchUpsNotice,
  modifyDrawNotice,
} from '../../notifications/drawNotifications';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
} from '../../../constants/errorConditionConstants';

export function attachConsolationStructures({
  tournamentRecord,
  drawDefinition,
  structures,
  links = [],
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!Array.isArray(structures) || !Array.isArray(links))
    return { error: INVALID_VALUES };

  if (links.length) drawDefinition.links.push(...links);
  const generatedStructureIds = structures.map(
    ({ structureId }) => structureId
  );
  const existingStructureIds = drawDefinition.structures.map(
    ({ structureId }) => structureId
  );

  // replace any existing structures with newly generated structures
  // this is done because it is possible that a consolation structure exists without matchUps
  drawDefinition.structures = drawDefinition.structures.map((structure) => {
    return generatedStructureIds.includes(structure.structureId)
      ? structures.find(
          ({ structureId }) => structureId === structure.structureId
        )
      : structure;
  });

  const newStructures = structures.filter(
    ({ structureId }) => !existingStructureIds.includes(structureId)
  );
  if (newStructures.length) drawDefinition.structures.push(...newStructures);

  const matchUps = structures
    .map((structure) => getAllStructureMatchUps({ structure })?.matchUps || [])
    .flat();

  addMatchUpsNotice({
    tournamentId: tournamentRecord?.tournamentId,
    drawDefinition,
    matchUps,
  });

  const structureIds = structures.map(({ structureId }) => structureId);
  modifyDrawNotice({ drawDefinition, structureIds });

  return { ...SUCCESS };
}
