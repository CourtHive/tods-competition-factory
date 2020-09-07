import { drawEngine } from 'src/drawEngine';
import { generateRange } from 'src/utilities';

import SEEDING_POLICY from 'src/fixtures/SEEDING_ITF';
import AVOIDANCE_POLICY from 'src/fixtures/AVOIDANCE_COUNTRY';

import { MAIN, FMLC, CONSOLATION } from 'src/constants/drawDefinitionConstants';

export function generateFMLC({drawSize, seedsCount, participantsCount}) {
  const drawType = FMLC;
  
  drawEngine.reset();
  drawEngine.newDrawDefinition();
  drawEngine.setStageDrawSize({ stage: MAIN, drawSize });
  drawEngine.generateDrawType({ drawType });
  
  const { structures: [mainStructure] } = drawEngine.getDrawStructures({ stage: MAIN, stageSequence: 1});
  const { structureId: mainStructureId } = mainStructure;
  
  const { structures: [consolationStructure] } = drawEngine.getDrawStructures({ stage: CONSOLATION, stageSequence: 1});
  const { structureId: consolationStructureId } = consolationStructure;
  
  drawEngine.loadPolicy(SEEDING_POLICY);
  drawEngine.loadPolicy(AVOIDANCE_POLICY);
  
  const participants = generateRange(0, participantsCount)
    .map(i => ({participantId: `fmlc-uuid${i+1}`}));
  const participantIds = participants.map(p=>p.participantId);
    
  drawEngine.addDrawEntries({ stage: MAIN, participantIds })
  drawEngine.initializeStructureSeedAssignments({ structureId: mainStructureId, seedsCount });
 
  generateRange(0, seedsCount).forEach(i => {
    const seedNumber = i + 1;
    const participantId = participants[i].participantId;
    drawEngine.assignSeed({structureId: mainStructureId, seedNumber, participantId});
  });

  drawEngine.automatedPositioning({ structureId: mainStructureId });

  return { mainStructureId, consolationStructureId };
}