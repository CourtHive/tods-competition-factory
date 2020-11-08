import {
  MISSING_MATCHUP,
  MISSING_STRUCTURE_ID,
  MISSING_DRAW_DEFINITION,
} from '../../constants/errorConditionConstants';

export function getMatchUpLinks({ drawDefinition, matchUp, structureId }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUp) return { error: MISSING_MATCHUP };
  if (!structureId) {
    ({ structureId } = matchUp);
  }

  const { links } = getStructureLinks({ drawDefinition, structureId });
  const source = links.source.reduce((source, link) => {
    return link.source.roundNumber === matchUp.roundNumber
      ? source.concat(link)
      : source;
  }, []);
  const target = links.target.reduce((target, link) => {
    return link.target.roundNumber === matchUp.roundNumber
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

export function getStructureLinks({ drawDefinition, structureId }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };
  const { links } = drawDefinition;
  const structureLinks = links.reduce(
    (structureLinks, link) => {
      if (link.source.structureId === structureId)
        structureLinks.source = structureLinks.source.concat(link);
      if (link.target.structureId === structureId)
        structureLinks.target = structureLinks.target.concat(link);
      return structureLinks;
    },
    { source: [], target: [] }
  );
  return { links: structureLinks };
}
