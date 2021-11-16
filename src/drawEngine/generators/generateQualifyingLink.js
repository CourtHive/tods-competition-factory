import { modifyDrawNotice } from '../notifications/drawNotifications';

import { MISSING_DRAW_DEFINITION } from '../../constants/errorConditionConstants';
import { DRAW, WINNER } from '../../constants/drawDefinitionConstants';

export function generateQualifyingLink({
  targetEntryRound = 1,
  sourceRoundNumber,
  sourceStructureId,
  targetStructureId,
  drawDefinition,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const link = {
    linkType: WINNER,
    source: {
      roundNumber: sourceRoundNumber,
      structureId: sourceStructureId,
    },
    target: {
      feedProfile: DRAW,
      roundNumber: targetEntryRound,
      structureId: targetStructureId,
    },
  };

  drawDefinition.links.push(link);

  modifyDrawNotice({ drawDefinition });
}
