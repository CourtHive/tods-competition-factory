import { decorateResult } from '../../global/functions/decorateResult';
import { overlap } from '../../tools/arrays';

import { LOSER, WINNER } from '../../constants/drawDefinitionConstants';
import { MISSING_STRUCTURE_ID, MISSING_DRAW_DEFINITION, INVALID_VALUES } from '../../constants/errorConditionConstants';

type GetRoundLinksArgs = {
  roundNumber?: number;
  structureId: string;
  drawDefinition: any;
};

// Return links which govern movement for a given matchUp either as a source or a target
export function getRoundLinks({
  drawDefinition, // passed automatically by drawEngine
  roundNumber, // optional - filter for only links that apply to roundNumber
  structureId, // structureId within which matchUp occurs
}: GetRoundLinksArgs) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };

  const { links } = getStructureLinks({ drawDefinition, structureId });

  const source = links.source.reduce((source, link) => {
    return !link.source.roundNumber || link.source.roundNumber === roundNumber ? source.concat(link) : source;
  }, []);
  const target = links.target.reduce((target, link) => {
    return !link.target.roundNumber || link.target.roundNumber === roundNumber ? target.concat(link) : target;
  }, []);
  return { links: { source, target } };
}

type GetTargetLinkArgs = {
  finishingPositions?: any;
  linkCondition?: string;
  linkType?: string;
  source: any[];
};

export function getTargetLink({ finishingPositions, linkCondition, linkType, source }: GetTargetLinkArgs) {
  const result = source.find((link) => {
    const positionCondition =
      !link.source?.finishingPositions ||
      !finishingPositions ||
      overlap(finishingPositions, link.source?.finishingPositions);
    const condition = linkCondition === link.linkCondition;
    return condition && positionCondition && link.linkType === linkType;
  });

  if ([WINNER, LOSER].includes(result?.linkType) && !result?.source?.roundNumber) {
    return decorateResult({
      result: { error: INVALID_VALUES },
      stack: 'getTargetLink',
      context: result,
    });
  }
  return result;
}

type GetStructureLinksArgs = {
  roundNumber?: number;
  structureId: string;
  drawDefinition: any;
};

// Returns all links for which a structure is either a source or a target; optionally filter by roundNumber
export function getStructureLinks({
  drawDefinition, //passed automatically by drawEngine
  structureId, // id of structure for which links are desired
  roundNumber, // optional - filter for links to or from specific rounds
}: GetStructureLinksArgs) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };
  const links = drawDefinition.links || [];
  const structureLinks = links.filter(Boolean).reduce(
    (structureLinks, link) => {
      if (link.source?.structureId === structureId && (!roundNumber || link.source.roundNumber === roundNumber))
        structureLinks.source = structureLinks.source.concat(link);
      if (link.target?.structureId === structureId && (!roundNumber || link.target.roundNumber === roundNumber))
        structureLinks.target = structureLinks.target.concat(link);
      return structureLinks;
    },
    { source: [], target: [] },
  );
  return { links: structureLinks };
}
