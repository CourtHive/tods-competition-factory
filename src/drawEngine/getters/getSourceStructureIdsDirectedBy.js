import { findStructure } from './findStructure';
import { getStructureLinks } from './linkGetter';

export function getSourceStructureIdsDirectedBy({
  drawDefinition,
  structureId,
  finishingPosition,
  linkType,
}) {
  const { links } =
    getStructureLinks({
      drawDefinition,
      structureId,
    }) || {};
  const sourceStructureIds = (links?.target || [])
    .filter(({ linkType: structureLinkType }) => structureLinkType === linkType)
    .map(({ source }) => source.structureId)
    .map((sourceStructureId) => {
      const { structure: sourceStructure } = findStructure({
        drawDefinition,
        structureId: sourceStructureId,
      });
      return {
        sourceStructureId,
        sourceFinishingPosition: sourceStructure.finishingPosition,
      };
    })
    .filter(
      ({ sourceFinishingPosition }) =>
        sourceFinishingPosition === finishingPosition
    )
    .map(({ sourceStructureId }) => sourceStructureId);

  return { sourceStructureIds };
}
