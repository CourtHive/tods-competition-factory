import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { decorateResult } from '../../../global/functions/decorateResult';
import {
  addMatchUpsNotice,
  modifyDrawNotice,
  modifyMatchUpNotice,
} from '../../notifications/drawNotifications';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  EXISTING_STRUCTURE,
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
} from '../../../constants/errorConditionConstants';

export function attachPlayoffStructures(params) {
  return attachStructures(params);
}

export function attachStructures({
  matchUpModifications,
  tournamentRecord,
  drawDefinition,
  structures,
  links = [],
  event,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!Array.isArray(structures) || !Array.isArray(links))
    return { error: INVALID_VALUES };

  const stack = 'attachStructures';

  const linkHash = (link) =>
    [
      link.source.structureId,
      link.source.roundNumber,
      link.target.roundNumber,
    ].join('|');

  const existingLinkHashes = drawDefinition.links.map(linkHash);

  const duplicateLink = links.some((link) => {
    const hash = linkHash(link);
    return existingLinkHashes.includes(hash);
  });

  if (duplicateLink)
    return decorateResult({
      result: { error: EXISTING_STRUCTURE },
      info: 'playoff structure exists',
      stack,
    });

  // TODO: ensure that all links are valid and reference structures that are/will be included in the drawDefinition
  if (links.length) drawDefinition.links.push(...links);

  const generatedStructureIds = structures.map(
    ({ structureId }) => structureId
  );
  const existingStructureIds = drawDefinition.structures.map(
    ({ structureId }) => structureId
  );

  // replace any existing structures with newly generated structures
  // this is done because it is possible that a structure exists without matchUps
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
    eventId: event?.eventId,
    drawDefinition,
    matchUps,
  });

  const structureIds = structures.map(({ structureId }) => structureId);
  modifyDrawNotice({ drawDefinition, structureIds });

  if (matchUpModifications?.length) {
    matchUpModifications.forEach(modifyMatchUpNotice);
  }

  return { ...SUCCESS };
}
