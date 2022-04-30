import { getStructureLinks } from './linkGetter';
import { findStructure } from './findStructure';

export function getSourceStructureIdsAndRelevantLinks({
  finishingPosition,
  targetRoundNumber,
  drawDefinition,
  structureId, // structure for which source and target links are to be found
  linkType, // only return links which match linkType
}) {
  const { links } =
    getStructureLinks({
      drawDefinition,
      structureId,
    }) || {};

  const sourceLinks = (links?.target || [])
    .filter(({ linkType: structureLinkType }) => structureLinkType === linkType)
    // if a target roundNumber is provided, only consider structures with link target matching roundNumber
    .filter(
      ({ target }) =>
        !targetRoundNumber || targetRoundNumber === target.roundNumber
    );

  const relevantLinks = sourceLinks
    .map((link) => {
      const sourceStructureId = link.source.structureId;
      const { structure: sourceStructure } = findStructure({
        structureId: sourceStructureId,
        drawDefinition,
      });

      // if finishingPosition has been specified and does not match, ignore link
      if (
        finishingPosition &&
        sourceStructure.finishingPosition !== finishingPosition
      )
        return;
      return link;
    })
    .filter(Boolean);

  const sourceStructureIds = relevantLinks.map(
    ({ source }) => source.structureId
  );

  /*
  const sourceStructureIds = sourceLinks
    .map(({ source }) => source.structureId)
    .map((sourceStructureId) => {
      const { structure: sourceStructure } = findStructure({
        structureId: sourceStructureId,
        drawDefinition,
      });
      return {
        sourceFinishingPosition: sourceStructure.finishingPosition,
        sourceStructureId,
      };
    })
    .filter(
      ({ sourceFinishingPosition }) =>
        !finishingPosition || sourceFinishingPosition === finishingPosition
    )
    .map(({ sourceStructureId }) => sourceStructureId);
    */

  return { sourceStructureIds, relevantLinks };
}
