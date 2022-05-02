import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { decorateResult } from '../../../global/functions/decorateResult';
import { findStructure } from '../../getters/findStructure';
import {
  addMatchUpsNotice,
  modifyDrawNotice,
} from '../../notifications/drawNotifications';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE,
  MISSING_TARGET_LINK,
} from '../../../constants/errorConditionConstants';

export function attachQualifyingStructure({
  tournamentRecord,
  drawDefinition,
  structure,
  eventId,
  link,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structure) return { error: MISSING_STRUCTURE };
  if (!link) return { error: MISSING_TARGET_LINK };

  const targetStructureId = link.target.structureId;
  const result = findStructure({
    drawDefinition,
    structureId: targetStructureId,
  });
  if (result.error)
    return decorateResult({
      stack: 'attachQualifyingStructure',
      context: { targetStructureId },
      result,
    });

  drawDefinition.structures.push(structure);
  drawDefinition.links.push(link);

  const matchUps = getAllStructureMatchUps({ structure })?.matchUps || [];

  addMatchUpsNotice({
    tournamentId: tournamentRecord?.tournamentId,
    drawDefinition,
    matchUps,
    eventId,
  });
  modifyDrawNotice({ drawDefinition, structureIds: [structure.structureId] });

  return { ...SUCCESS };
}
