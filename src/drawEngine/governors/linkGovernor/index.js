import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { WINNER, DRAW } from '../../../constants/drawDefinitionConstants';

function generateQualifyingLink({
  qualifyingStructureId,
  mainStructureId,
  qualifyingRound,
  mainEntryRound = 1,
  drawDefinition,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  const link = {
    linkType: WINNER,
    source: {
      roundNumber: qualifyingRound,
      structureId: qualifyingStructureId,
    },
    target: {
      feedProfile: DRAW,
      roundNumber: mainEntryRound,
      structureId: mainStructureId,
    },
  };

  drawDefinition.links.push(link);
}

const linkGovernor = {
  generateQualifyingLink,
};

export default linkGovernor;
