import { WINNER, DRAW } from 'competitionFactory/constants/drawDefinitionConstants';

function createQualifyingLink({
  qualifyingStructureId,
  mainStructureId,
  qualifyingRound,
  mainEntryRound=1,
  drawDefinition
}) {
 
  const link = {
    linkSubject: WINNER,
    source: {
      roundNumber: qualifyingRound,
      structureId: qualifyingStructureId,
    },
    target: {
      feedProfile: DRAW,
      roundNumber: mainEntryRound,
      structureId: mainStructureId
    }
  };
  
  drawDefinition.links.push(link); 
}

const linkGovernor = {
  createQualifyingLink,
};

export default linkGovernor;