import { modifyDrawNotice } from '../notifications/drawNotifications';

import { MISSING_DRAW_DEFINITION } from '../../constants/errorConditionConstants';
import { DRAW, WINNER } from '../../constants/drawDefinitionConstants';
import { definedAttributes } from '../../utilities/objects';

export function generateQualifyingLink({
  targetEntryRound = 1,
  finishingPositions,
  sourceRoundNumber,
  sourceStructureId,
  targetStructureId,
  linkType = WINNER,
  drawDefinition,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

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

  drawDefinition.links.push(link);

  modifyDrawNotice({ drawDefinition });
}
