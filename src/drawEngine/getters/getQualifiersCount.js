import { getAllStructureMatchUps } from './getMatchUps/getAllStructureMatchUps';
import { getEntryProfile } from './getEntryProfile';
import { findStructure } from './findStructure';

import { MISSING_DRAW_DEFINITION } from '../../constants/errorConditionConstants';
import { CONTAINER } from '../../constants/drawDefinitionConstants';

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

  const roundQualifiersCounts = {};

  if (!structureId)
    return { qualifiersCount: profileQualifiersCount, roundQualifiersCounts };

  const { structure } = findStructure({ drawDefinition, structureId });
  const relevantLinks = drawDefinition.links?.filter(
    (link) => link?.target?.structureId === structure?.structureId
  );

  let qualifiersCount = 0;

  // if structureId is provided and there is a relevant link...
  if (relevantLinks?.length) {
    for (const relevantLink of relevantLinks) {
      const sourceStructure = findStructure({
        structureId: relevantLink.source.structureId,
        drawDefinition,
      })?.structure;

      const sourceRoundNumber = relevantLink.source.roundNumber;
      const roundTarget = relevantLink.target.roundNumber;
      let count = 0;

      if (sourceStructure.structureType === CONTAINER) {
        // for Round Robin qualifying the number of qualifiers needs to be derived from:
        // the number of groups (substructures) * the length of source.finishingPositions[]
        const groupCount = sourceStructure.structures?.length || 0;
        const finishingPositionsCount =
          relevantLink.source.finishingPositions?.length || 0;

        count = groupCount * finishingPositionsCount;
      } else {
        // return source structure qualifying round matchUps count
        const matchUps = getAllStructureMatchUps({
          roundFilter: sourceRoundNumber,
          structure: sourceStructure,
          inContext: false,
        }).matchUps;

        count = matchUps?.length || 0;
      }

      if (!roundQualifiersCounts[roundTarget])
        roundQualifiersCounts[roundTarget] = 0;
      roundQualifiersCounts[roundTarget] += count;

      qualifiersCount += count;
    }
  }

  qualifiersCount = Math.max(qualifiersCount, profileQualifiersCount);

  if (qualifiersCount !== profileQualifiersCount) {
    /*
    console.log(
      {
        qualifiersCount,
        profileQualifiersCount,
        roundQualifiersCounts,
      },
      relevantLinks.map((link) => link.source.finishingPositions)
    );
    */
    return { qualifiersCount: profileQualifiersCount, roundQualifiersCounts };
  }

  return { qualifiersCount, roundQualifiersCounts };
}
