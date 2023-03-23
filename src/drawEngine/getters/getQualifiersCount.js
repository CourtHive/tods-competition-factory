import { getAllStructureMatchUps } from './getMatchUps/getAllStructureMatchUps';
import { getEntryProfile } from './getEntryProfile';
import { findStructure } from './findStructure';

import { MISSING_DRAW_DEFINITION } from '../../constants/errorConditionConstants';
import { CONTAINER, QUALIFYING } from '../../constants/drawDefinitionConstants';

export function getQualifiersCount({
  provisionalPositioning,
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

      if (sourceStructure.stage === QUALIFYING) {
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
            matchUpFilters: { roundNumbers: [sourceRoundNumber] },
            provisionalPositioning,
            structure: sourceStructure,
            afterRecoveryTimes: false,
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
  }

  // allow profileQualifiersCount to override if and only if there is only one qualifying roundTarget
  const qualifyingRounds = Object.keys(roundQualifiersCounts);
  if (qualifyingRounds.length <= 1) {
    const qualifyingRound = qualifyingRounds[0] || 1;
    roundQualifiersCounts[qualifyingRound] = Math.max(
      roundQualifiersCounts[qualifyingRound] || 0,
      profileQualifiersCount
    );
  }

  qualifiersCount = Math.max(qualifiersCount, profileQualifiersCount);

  return { qualifiersCount, roundQualifiersCounts };
}
