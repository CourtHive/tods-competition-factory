import {
  generateRange,
  intersection,
  overlap,
  unique,
} from '../../../utilities';

import { VOLUNTARY_CONSOLATION } from '../../../constants/drawDefinitionConstants';

/**
 * return an array of arrays of grouped structureIds => structureGroups
 * the expectation is that all structures within a drawDefintion are linked
 * return a boolean whether this condition is met => allSructuresLinked
 */
export function getStructureGroups({ drawDefinition }) {
  const links = drawDefinition.links || [];

  const sourceStructureIds = {};
  let linkedStructureIds = links.map((link) => {
    const sourceId = link.source.structureId;
    const targetId = link.target.structureId;
    sourceStructureIds[targetId] = unique([
      ...(sourceStructureIds[targetId] || []),
      sourceId,
    ]).filter(Boolean);

    return [link.source.structureId, link.target.structureId];
  });

  // iterate through all groups of structureIds to flatten tree of links between structures
  const iterations = linkedStructureIds.length;
  generateRange(0, Math.ceil(iterations / 2)).forEach(() => {
    linkedStructureIds = generateRange(0, iterations).map((index) => {
      const structureIds = linkedStructureIds[index];
      const mergedWithOverlappingIds =
        linkedStructureIds.reduce((biggest, ids) => {
          const hasOverlap = overlap(structureIds, ids);
          return hasOverlap ? biggest.concat(...ids) : biggest;
        }, []) || [];
      return unique(structureIds.concat(...mergedWithOverlappingIds));
    });
  });

  // at this point all linkedStructureIds arrays should be equivalent
  // use the first of these as the identity array
  const groupedStructureIds = linkedStructureIds[0];

  // utility method to recognize equivalent arrays of structureIds
  const identityLink = (a, b) => intersection(a, b).length === a.length;

  // check that all arrays of linkedStructureIds are equivalent to identity array
  const allLinkStructuresLinked = linkedStructureIds
    .slice(1)
    .reduce((allLinkStructuresLinked, ids) => {
      return allLinkStructuresLinked && identityLink(ids, groupedStructureIds);
    }, true);

  // if a drawDefinition contains no links then no structure groups will exist
  // filter out undefined when there are no links in a drawDefinition
  const structureGroups = [groupedStructureIds].filter(Boolean);

  // this is the same as structureGroups, but excludes VOLUNTARY_CONSOLATION
  const linkCheck = [groupedStructureIds].filter(Boolean);

  // iterate through all structures to add missing structureIds
  const structures = drawDefinition.structures || [];
  structures.forEach((structure) => {
    const { structureId, stage } = structure;
    const existingGroup = structureGroups.find((group) => {
      return group.includes(structureId);
    });
    if (!existingGroup) {
      structureGroups.push([structureId]);
      if (stage !== VOLUNTARY_CONSOLATION) linkCheck.push(structureId);
    }
  });

  const allStructuresLinked = allLinkStructuresLinked && linkCheck.length === 1;

  return { structureGroups, allStructuresLinked, sourceStructureIds };
}
