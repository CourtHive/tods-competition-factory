import { modifyDrawNotice } from '../../notifications/drawNotifications';

import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { WINNER, DRAW } from '../../../constants/drawDefinitionConstants';

function generateQualifyingLink({
  qualifyingStructureId,
  mainStructureId,
  qualifyingRoundNumber,
  mainEntryRound = 1,
  drawDefinition,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  const link = {
    linkType: WINNER,
    source: {
      roundNumber: qualifyingRoundNumber,
      structureId: qualifyingStructureId,
    },
    target: {
      feedProfile: DRAW,
      roundNumber: mainEntryRound,
      structureId: mainStructureId,
    },
  };

  drawDefinition.links.push(link);

  modifyDrawNotice({ drawDefinition });
}

const linkGovernor = {
  generateQualifyingLink,
};

export default linkGovernor;
