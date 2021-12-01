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

export function attachPlayoffStructures({ drawDefinition, structures, links }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!Array.isArray(structures) || !Array.isArray(links))
    return { error: INVALID_VALUES };

  const structureIds = structures.map(({ structureId }) => structureId);
  drawDefinition.structures.push(...structures);
  drawDefinition.links.push(...links);

  const matchUps = structures
    .map((structure) => getAllStructureMatchUps({ structure })?.matchUps || [])
    .flat();

  addMatchUpsNotice({ drawDefinition, matchUps });
  modifyDrawNotice({ drawDefinition, structureIds });

  return { ...SUCCESS };
}
