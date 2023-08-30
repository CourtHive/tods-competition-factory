import { definedAttributes } from '../../utilities/objects';

import { MISSING_STRUCTURE_ID } from '../../constants/errorConditionConstants';
import { DRAW } from '../../constants/drawDefinitionConstants';
import { LinkTypeEnum } from '../../types/tournamentFromSchema';

type GenerateQualifyingLinkArgs = {
  targetEntryRound?: number;
  sourceRoundNumber: number;
  finishingPositions?: any;
  sourceStructureId: string;
  targetStructureId: string;
  linkType?: LinkTypeEnum;
};
export function generateQualifyingLink({
  targetEntryRound = 1,
  finishingPositions,
  sourceRoundNumber,
  sourceStructureId,
  targetStructureId,
  linkType = LinkTypeEnum.Winner,
}: GenerateQualifyingLinkArgs) {
  if (!sourceStructureId || !targetStructureId)
    return { error: MISSING_STRUCTURE_ID };

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
