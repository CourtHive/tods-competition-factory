import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import {
  addMatchUpsNotice,
  modifyDrawNotice,
} from '../../notifications/drawNotifications';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE,
} from '../../../constants/errorConditionConstants';

export function attachQualifyingStructure({
  tournamentRecord,
  drawDefinition,
  structure,
  links,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structure) return { error: MISSING_STRUCTURE };

  drawDefinition.structures.push(structure);
  drawDefinition.links.push(...links);

  const matchUps = getAllStructureMatchUps({ structure })?.matchUps || [];

  addMatchUpsNotice({
    tournamentId: tournamentRecord?.tournamentId,
    eventId: event?.eventId,
    drawDefinition,
    matchUps,
  });
  modifyDrawNotice({ drawDefinition, structureIds: [structure.structureId] });

  return { ...SUCCESS };
}
