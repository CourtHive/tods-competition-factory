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

export function attachPlayoffStructures({
  tournamentRecord,
  drawDefinition,
  structures,
  event,
  links,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!Array.isArray(structures) || !Array.isArray(links))
    return { error: INVALID_VALUES };

  const linkHash = (link) =>
    [
      link.source.structureId,
      link.source.roundNumber,
      link.target.roundNumber,
    ].join('|');

  const existingLinkHashes = drawDefinition.links.map(linkHash);

  const duplicateLink = links.some((link) =>
    existingLinkHashes.includes(linkHash(link))
  );
  console.log({ duplicateLink });

  const structureIds = structures.map(({ structureId }) => structureId);
  drawDefinition.structures.push(...structures);
  drawDefinition.links.push(...links);

  const matchUps = structures
    .map((structure) => getAllStructureMatchUps({ structure })?.matchUps || [])
    .flat();

  addMatchUpsNotice({
    tournamentId: tournamentRecord?.tournamentId,
    eventId: event?.eventId,
    drawDefinition,
    matchUps,
  });
  modifyDrawNotice({ drawDefinition, structureIds });

  return { ...SUCCESS };
}
