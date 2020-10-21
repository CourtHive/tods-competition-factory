import { WINNER, DRAW } from '../../../constants/drawDefinitionConstants';

function createQualifyingLink({
  qualifyingStructureId,
  mainStructureId,
  qualifyingRound,
  mainEntryRound = 1,
  drawDefinition,
}) {
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
  createQualifyingLink,
};

export default linkGovernor;
