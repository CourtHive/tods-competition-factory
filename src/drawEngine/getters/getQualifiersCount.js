import { getAllStructureMatchUps } from './getMatchUps/getAllStructureMatchUps';
import { getEntryProfile } from './getEntryProfile';
import { findStructure } from './findStructure';

import { POSITION, QUALIFYING } from '../../constants/drawDefinitionConstants';

export function getQualifiersCount({
  drawDefinition,
  stageSequence,
  structureId,
  stage,
}) {
  const { structure } = findStructure({ drawDefinition, structureId });
  const relevantLink = drawDefinition.links?.find(
    (link) =>
      link?.linkType !== POSITION &&
      link?.target?.structureId === structure?.structureId &&
      link?.target?.roundNumber === 1
  );

  // TODO: for Round Robin qualifying the number of qualifiers needs to be derived
  // from the number of groups (substructures) * the length of source.finishingPositions[]

  // if structureId is provided and there is a relevant link...
  // return source structure qualifying round matchUps count
  if (relevantLink && structure.stage === QUALIFYING) {
    const sourceStructure = findStructure({
      structureId: relevantLink.source.structureId,
      drawDefinition,
    })?.structure;
    const sourceRoundNumber = relevantLink.source.roundNumber;
    const matchUps = getAllStructureMatchUps({
      roundFilter: sourceRoundNumber,
      structure: sourceStructure,
      inContext: false,
    }).matchUps;
    if (matchUps?.length) return matchUps.length;
  }

  const { entryProfile } = getEntryProfile({ drawDefinition });
  return (
    entryProfile?.[stage]?.stageSequence?.[stageSequence]?.qualifiersCount ||
    entryProfile?.[stage]?.qualifiersCount ||
    0
  );
}
