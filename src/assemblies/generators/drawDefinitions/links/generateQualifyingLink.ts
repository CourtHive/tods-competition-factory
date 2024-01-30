import { definedAttributes } from '../../../../tools/definedAttributes';

import { MISSING_STRUCTURE_ID } from '@Constants/errorConditionConstants';
import { DRAW, WINNER } from '@Constants/drawDefinitionConstants';
import { LinkTypeUnion } from '../../../../types/tournamentTypes';

type GenerateQualifyingLinkArgs = {
  targetEntryRound?: number;
  sourceRoundNumber: number;
  finishingPositions?: any;
  sourceStructureId: string;
  targetStructureId: string;
  linkType?: LinkTypeUnion;
};
export function generateQualifyingLink({
  targetEntryRound = 1,
  finishingPositions,
  sourceRoundNumber,
  sourceStructureId,
  targetStructureId,
  linkType = WINNER,
}: GenerateQualifyingLinkArgs) {
  if (!sourceStructureId || !targetStructureId) return { error: MISSING_STRUCTURE_ID };

  const link = definedAttributes({
    linkType,
    source: {
      roundNumber: sourceRoundNumber,
      structureId: sourceStructureId,
      finishingPositions,
    },
    target: {
      feedProfile: DRAW, // positions are not automatically placed
      roundNumber: targetEntryRound,
      structureId: targetStructureId,
    },
  });

  return { link };
}
