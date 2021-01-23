import {
  MISSING_STRUCTURE_ID,
  MISSING_DRAW_DEFINITION,
} from '../../constants/errorConditionConstants';

/**
 *
 * Return links which govern movement for a given matchUp either as a source or a target
 *
 * @param {object} drawDefinition - passed automatically by drawEngine
 * @param {object} matchUp - matchUp for which links are sought
 * @param {string} structureId - optional - structureId within which matchUp occurs
 * @param {number} roundNumber - optional - filter for only links that apply to roundNumber
 *
 */
export function getRoundLinks({ drawDefinition, roundNumber, structureId }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };

  const { links } = getStructureLinks({ drawDefinition, structureId });
  if (!roundNumber) return { links };

  const source = links.source.reduce((source, link) => {
    return link.source.roundNumber === roundNumber
      ? source.concat(link)
      : source;
  }, []);
  const target = links.target.reduce((target, link) => {
    return link.target.roundNumber === roundNumber
      ? target.concat(link)
      : target;
  }, []);
  return { links: { source, target } };
}

export function getTargetLink({ source, subject }) {
  const target = source.reduce((target, link) => {
    return link.linkType === subject ? link : target;
  }, undefined);
  return target;
}

/**
 * Returns all links for which a structure is either a source or a target; optionally filter by roundNumber
 *
 * @param {object} drawDefinition - passed automatically by drawEngine
 * @param {string} structureId - id of structure for which links are desired
 * @param {number} roundNumber - optional - filter for links to or from specific rounds
 */
export function getStructureLinks({
  drawDefinition,
  structureId,
  roundNumber,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };
  const { links } = drawDefinition;
  const structureLinks = links.reduce(
    (structureLinks, link) => {
      if (
        link.source.structureId === structureId &&
        (!roundNumber || link.source.roundNumber === roundNumber)
      )
        structureLinks.source = structureLinks.source.concat(link);
      if (
        link.target.structureId === structureId &&
        (!roundNumber || link.target.roundNumber === roundNumber)
      )
        structureLinks.target = structureLinks.target.concat(link);
      return structureLinks;
    },
    { source: [], target: [] }
  );
  return { links: structureLinks };
}
