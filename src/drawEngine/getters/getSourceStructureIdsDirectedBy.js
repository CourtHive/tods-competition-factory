import { findStructure } from './findStructure';
import { getStructureLinks } from './linkGetter';

export function getSourceStructureIdsDirectedBy({
  finishingPosition,
  targetRoundNumber,
  drawDefinition,
  structureId,
  linkType,
}) {
  const { links } =
    getStructureLinks({
      drawDefinition,
      structureId,
    }) || {};

  const sourceStructureIds = (links?.target || [])
    .filter(({ linkType: structureLinkType }) => structureLinkType === linkType)
    // if a target roundNumber is provided, only consider structures with link target matching roundNumber
    .filter(
      ({ target }) =>
        !targetRoundNumber || targetRoundNumber === target.roundNumber
    )
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
        sourceFinishingPosition === finishingPosition
    )
    .map(({ sourceStructureId }) => sourceStructureId);

  return { sourceStructureIds };
}
