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
import {
  DrawDefinition,
  DrawLink,
  Structure,
} from '../../../types/tournamentFromSchema';

type AttachQualifyingArgs = {
  drawDefinition: DrawDefinition;
  structure: Structure;
  tournamentId?: string;
  eventId?: string;
  link: DrawLink;
};
export function attachQualifyingStructure({
  drawDefinition,
  tournamentId,
  structure,
  eventId,
  link,
}: AttachQualifyingArgs) {
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

  if (!drawDefinition.structures) drawDefinition.structures = [];
  if (!drawDefinition.links) drawDefinition.links = [];
  drawDefinition.structures.push(structure);
  drawDefinition.links.push(link);

  const matchUps = getAllStructureMatchUps({ structure })?.matchUps || [];

  addMatchUpsNotice({
    drawDefinition,
    tournamentId,
    matchUps,
    eventId,
  });
  modifyDrawNotice({ drawDefinition, structureIds: [structure.structureId] });

  return { ...SUCCESS };
}
