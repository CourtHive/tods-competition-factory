import { resequenceStructures } from './structureGovernor/resequenceStructures';
import { getAllStructureMatchUps } from '@Query/matchUps/getAllStructureMatchUps';
import { addTournamentTimeItem } from '../timeItems/addTimeItem';
import { decorateResult } from '../../functions/global/decorateResult';
import { findStructure } from '../../acquire/findStructure';
import { addMatchUpsNotice, modifyDrawNotice } from '../notifications/drawNotifications';

import { SUCCESS } from '@Constants/resultConstants';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE,
  MISSING_TARGET_LINK,
  MISSING_TOURNAMENT_RECORD,
} from '@Constants/errorConditionConstants';
import { DrawDefinition, DrawLink, Structure } from '@Types/tournamentTypes';

export function attachQualifyingStructure({ tournamentRecord, drawDefinition, structure, link }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const result = attachQualifying({
    tournamentId: tournamentRecord.tournamentId,
    drawDefinition,
    structure,
    link,
  });
  if (result.error) return result;

  const qualifyingDetails = {
    structureId: structure.structureId,
    drawId: drawDefinition.drawId,
  };

  const timeItem = {
    itemType: 'attachQualifyingStructures',
    itemValue: qualifyingDetails,
  };
  addTournamentTimeItem({ tournamentRecord, timeItem });

  return result;
}

type AttachQualifyingArgs = {
  drawDefinition: DrawDefinition;
  tournamentId?: string;
  structure: Structure;
  eventId?: string;
  link: DrawLink;
};
export function attachQualifying({ drawDefinition, tournamentId, structure, eventId, link }: AttachQualifyingArgs) {
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

  resequenceStructures({ drawDefinition });

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
