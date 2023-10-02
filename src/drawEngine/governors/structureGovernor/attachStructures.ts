import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { addGoesTo } from '../matchUpGovernor/addGoesTo';
import { extractAttributes } from '../../../utilities';
import {
  addMatchUpsNotice,
  modifyDrawNotice,
  modifyMatchUpNotice,
} from '../../notifications/drawNotifications';
import {
  ResultType,
  decorateResult,
} from '../../../global/functions/decorateResult';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  EXISTING_STRUCTURE,
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
} from '../../../constants/errorConditionConstants';
import {
  DrawDefinition,
  DrawLink,
  Event,
  Structure,
  Tournament,
} from '../../../types/tournamentFromSchema';

export function attachPlayoffStructures(params) {
  return attachStructures(params);
}

type AttachStructuresArgs = {
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  matchUpModifications?: any[];
  structures: Structure[];
  links?: DrawLink[];
  event?: Event;
};
export function attachStructures({
  matchUpModifications,
  tournamentRecord,
  drawDefinition,
  structures,
  links = [],
  event,
}: AttachStructuresArgs): ResultType & { addedStructureIds?: string[] } {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!Array.isArray(structures) || !Array.isArray(links))
    return decorateResult({ result: { error: INVALID_VALUES } });

  const stack = 'attachStructures';

  const linkHash = (link) =>
    [
      link.source.structureId,
      link.source.roundNumber || link.source.finishingPositions?.join('|'),
      link.target.roundNumber,
    ].join('|');

  const existingLinkHashes = drawDefinition.links?.map(linkHash);

  const duplicateLink = links.some((link) => {
    const hash = linkHash(link);
    return existingLinkHashes?.includes(hash);
  });

  if (duplicateLink)
    return decorateResult({
      result: { error: EXISTING_STRUCTURE },
      info: 'playoff structure exists',
      stack,
    });

  // TODO: ensure that all links are valid and reference structures that are/will be included in the drawDefinition
  if (links.length) drawDefinition.links?.push(...links);

  const generatedStructureIds = structures.map(
    ({ structureId }) => structureId
  );
  const existingStructureIds = drawDefinition.structures?.map(
    ({ structureId }) => structureId
  );

  // replace any existing structures with newly generated structures
  // this is done because it is possible that a structure exists without matchUps
  drawDefinition.structures = (drawDefinition.structures || []).map(
    (structure) => {
      return generatedStructureIds.includes(structure.structureId)
        ? structures.find(
            ({ structureId }) => structureId === structure.structureId
          )
        : structure;
    }
  ) as Structure[];

  const newStructures = structures?.filter(
    ({ structureId }) => !existingStructureIds?.includes(structureId)
  );
  if (newStructures.length) drawDefinition.structures.push(...newStructures);

  addGoesTo({ drawDefinition });

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
    const modifiedMatchUpMap = {};
    matchUpModifications.forEach((modification) => {
      const matchUpId = modification.matchUp?.matchUpId;
      if (matchUpId) {
        modifiedMatchUpMap[matchUpId] = modification;
      }
    });

    // This is necessary to support external data stores in client/server architectures
    // where the data store, e.g. Mongo, requires additional attributes to be present
    // for each matchUp for which there are modifications, merge matchUp in state with modifications
    // also descend into tieMatchUps, when present, with the same logic
    const modifyStructureMatchUps = (structure) => {
      structure.matchUps.forEach((matchUp) => {
        if (modifiedMatchUpMap[matchUp.matchUpId]) {
          const { tieMatchUps, ...attribs } =
            modifiedMatchUpMap[matchUp.matchUpId].matchUp;
          Object.assign(matchUp, attribs);
          if (tieMatchUps?.length) {
            const modifiedTieMatchUpsMap = {};
            tieMatchUps.forEach(
              (modifiedTieMatchUp) =>
                (modifiedMatchUpMap[modifiedTieMatchUp.matchUpId] =
                  modifiedTieMatchUp)
            );
            matchUp.tieMatchUps.forEach((tm) =>
              Object.assign(tm, modifiedTieMatchUpsMap[tm.matchUpId])
            );
          }
          modifiedMatchUpMap[matchUp.matchUpId].matchUp = matchUp;
          modifyMatchUpNotice(modifiedMatchUpMap[matchUp.matchUpId]);
        }
      });
    };

    // pre-existing structures must be updated if any matchUpModifications were passed into this method
    drawDefinition.structures.forEach((structure) => {
      if (existingStructureIds?.includes(structure.structureId)) {
        if (structure.structures) {
          for (const subStructure of structure.structures) {
            modifyStructureMatchUps(subStructure);
          }
        } else {
          modifyStructureMatchUps(structure);
        }
      }
    });
  }

  const addedStructureIds = newStructures.map(extractAttributes('structureId'));

  return { ...SUCCESS, addedStructureIds };
}
