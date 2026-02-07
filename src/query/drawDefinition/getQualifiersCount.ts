import { getAllStructureMatchUps } from '../matchUps/getAllStructureMatchUps';
import { findStructure } from '@Acquire/findStructure';
import { getEntryProfile } from './getEntryProfile';

// constants and types
import { MISSING_DRAW_DEFINITION } from '@Constants/errorConditionConstants';
import { CONTAINER, QUALIFYING } from '@Constants/drawDefinitionConstants';
import { DrawDefinition } from '@Types/tournamentTypes';

type GetQualifiersCountArgs = {
  provisionalPositioning?: boolean;
  drawDefinition: DrawDefinition;
  stageSequence?: number;
  structureId?: string;
  stage?: string;
};
function calculateQualifiersFromLinks({
  relevantLinks,
  drawDefinition,
  provisionalPositioning,
  roundQualifiersCounts,
}: {
  relevantLinks: any[];
  drawDefinition: DrawDefinition;
  provisionalPositioning?: boolean;
  roundQualifiersCounts: Record<string, number>;
}) {
  let qualifiersCount = 0;

  for (const relevantLink of relevantLinks) {
    const sourceStructure = findStructure({
      structureId: relevantLink.source.structureId,
      drawDefinition,
    })?.structure;

    if (sourceStructure?.stage === QUALIFYING) {
      const sourceRoundNumber: number = relevantLink.source.roundNumber as number;
      const roundTarget = relevantLink.target.roundNumber;
      let count: number;

      if (sourceStructure.structureType === CONTAINER) {
        const groupCount = sourceStructure.structures?.length ?? 0;
        const finishingPositionsCount = relevantLink.source.finishingPositions?.length ?? 0;
        count = groupCount * finishingPositionsCount;
      } else {
        const matchUps = getAllStructureMatchUps({
          matchUpFilters: { roundNumbers: [sourceRoundNumber] },
          structure: sourceStructure,
          afterRecoveryTimes: false,
          provisionalPositioning,
          inContext: false,
        }).matchUps;
        count = matchUps?.length || 0;
      }

      if (!roundQualifiersCounts[roundTarget]) roundQualifiersCounts[roundTarget] = 0;
      roundQualifiersCounts[roundTarget] += count;
      qualifiersCount += count;
    }
  }

  return qualifiersCount;
}

export function getQualifiersCount(params: GetQualifiersCountArgs) {
  const { provisionalPositioning, drawDefinition, stageSequence, structureId, stage } = params;
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const { entryProfile } = getEntryProfile({ drawDefinition });
  const profileQualifiersCount =
    (stage && stageSequence && entryProfile?.[stage]?.stageSequence?.[stageSequence]?.qualifiersCount) ||
    (stage && entryProfile?.[stage]?.qualifiersCount) ||
    0;

  const roundQualifiersCounts = {};

  if (!structureId) return { qualifiersCount: profileQualifiersCount, roundQualifiersCounts };

  const { structure } = findStructure({ drawDefinition, structureId });
  const relevantLinks = drawDefinition.links?.filter((link) => link?.target?.structureId === structure?.structureId);

  let qualifiersCount = 0;

  if (relevantLinks?.length) {
    qualifiersCount = calculateQualifiersFromLinks({
      relevantLinks,
      drawDefinition,
      provisionalPositioning,
      roundQualifiersCounts,
    });
  }

  const qualifyingRounds = Object.keys(roundQualifiersCounts);
  if (qualifyingRounds.length <= 1) {
    const qualifyingRound = qualifyingRounds[0] || 1;
    roundQualifiersCounts[qualifyingRound] = Math.max(
      roundQualifiersCounts[qualifyingRound] || 0,
      profileQualifiersCount,
    );
  }

  qualifiersCount = Math.max(qualifiersCount, profileQualifiersCount);

  return { qualifiersCount, roundQualifiersCounts };
}
