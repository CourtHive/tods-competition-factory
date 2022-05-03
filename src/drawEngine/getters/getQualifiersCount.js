import { getAllStructureMatchUps } from './getMatchUps/getAllStructureMatchUps';
import { getEntryProfile } from './getEntryProfile';
import { findStructure } from './findStructure';

import { MISSING_DRAW_DEFINITION } from '../../constants/errorConditionConstants';
import { CONTAINER, QUALIFYING } from '../../constants/drawDefinitionConstants';

export function getQualifiersCount({
  drawDefinition,
  stageSequence,
  structureId,
  stage,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const { entryProfile } = getEntryProfile({ drawDefinition });
  const profileQualifiersCount =
    entryProfile?.[stage]?.stageSequence?.[stageSequence]?.qualifiersCount ||
    entryProfile?.[stage]?.qualifiersCount ||
    0;
  if (!structureId) return { qualifiersCount: profileQualifiersCount };

  const { structure } = findStructure({ drawDefinition, structureId });
  const relevantLink = drawDefinition.links?.find(
    (link) =>
      link?.target?.structureId === structure?.structureId &&
      link?.target?.roundNumber === 1
  );

  // if structureId is provided and there is a relevant link...
  if (relevantLink && structure?.stage === QUALIFYING) {
    const sourceStructure = findStructure({
      structureId: relevantLink.source.structureId,
      drawDefinition,
    })?.structure;
    const sourceRoundNumber = relevantLink.source.roundNumber;

    if (sourceStructure.structureType === CONTAINER) {
      // for Round Robin qualifying the number of qualifiers needs to be derived from:
      // the number of groups (substructures) * the length of source.finishingPositions[]
      const groupCount = sourceStructure.structures?.length || 0;
      const finishingPositionsCount =
        relevantLink.source.finishingPositions?.length || 0;

      return { qualifiersCount: groupCount * finishingPositionsCount };
    } else {
      // return source structure qualifying round matchUps count
      const matchUps = getAllStructureMatchUps({
        roundFilter: sourceRoundNumber,
        structure: sourceStructure,
        inContext: false,
      }).matchUps;

      if (matchUps?.length) return { qualifiersCount: matchUps.length };
    }
  }

  return { qualifiersCount: profileQualifiersCount };
}
