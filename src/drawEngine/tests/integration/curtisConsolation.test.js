import fs from 'fs';
import { drawEngine } from 'competitionFactory/drawEngine';
import { generateRange } from 'competitionFactory/utilities';
import { MAIN, CONSOLATION, CURTIS } from 'competitionFactory/constants/drawDefinitionConstants';

import { verifyStructure } from 'competitionFactory/drawEngine/tests/primitives/verifyStructure';
import SEEDING_POLICY from 'competitionFactory/fixtures/SEEDING_ITF';
import AVOIDANCE_POLICY from 'competitionFactory/fixtures/AVOIDANCE_COUNTRY';

it('can generate and verify curtis structures', () => {
  let mainStructureId, consolation1stStructureId, consolation2ndStructureId, playoffStructureId;
 
  ({
    mainStructureId,
    consolation1stStructureId,
    consolation2ndStructureId
  } = generateCurtis({
    drawSize: 32,
    seedsCount: 8,
    assignSeeds: 8,
    participantsCount: 30
  }));

  verifyStructure({
    structureId: mainStructureId,
    expectedSeeds: 8,
    expectedSeedsWithByes: 2,
    expectedByeAssignments: 2,
    expectedSeedValuesWithBye: [1,2],
    expectedPositionsAssignedCount: 32,
    expectedRoundMatchUpsCounts: [16,8,4,2,1]
  });
  
  verifyStructure({
    structureId: consolation1stStructureId,
    expectedSeeds: 0,
    expectedSeedsWithByes: 0,
    expectedByeAssignments: 2,
    expectedSeedValuesWithBye: [],
    expectedPositionsAssignedCount: 2,
    expectedRoundMatchUpsCounts: [8,8,4,2,1]
  });
  
  verifyStructure({
    structureId: consolation2ndStructureId,
    expectedSeeds: 0,
    expectedSeedsWithByes: 0,
    expectedByeAssignments: 0,
    expectedSeedValuesWithBye: [],
    expectedPositionsAssignedCount: 0,
    expectedRoundMatchUpsCounts: [2,2,1]
  });
 
  ({
    mainStructureId,
    consolation1stStructureId,
    consolation2ndStructureId,
    playoffStructureId
  } = generateCurtis({
    drawSize: 64,
    seedsCount: 16,
    assignSeeds: 14,
    participantsCount: 60
  }));

  verifyStructure({
    structureId: mainStructureId,
    expectedSeeds: 14,
    expectedSeedsWithByes: 4,
    expectedByeAssignments: 4,
    expectedSeedValuesWithBye: [1,2,3,4],
    expectedPositionsAssignedCount: 64,
    expectedRoundMatchUpsCounts: [32,16,8,4,2,1]
  });
 
  verifyStructure({
    structureId: playoffStructureId,
    expectedSeeds: 0,
    expectedSeedsWithByes: 0,
    expectedByeAssignments: 0,
    expectedSeedValuesWithBye: [],
    expectedPositionsAssignedCount: 0,
    expectedRoundMatchUpsCounts: [1]
  });

  verifyStructure({
    structureId: consolation1stStructureId,
    expectedSeeds: 0,
    expectedSeedsWithByes: 0,
    expectedByeAssignments: 4,
    expectedSeedValuesWithBye: [],
    expectedPositionsAssignedCount: 4,
    expectedRoundMatchUpsCounts: [16,16,8,4,2,1]
  });

  verifyStructure({
    structureId: consolation2ndStructureId,
    expectedSeeds: 0,
    expectedSeedsWithByes: 0,
    expectedByeAssignments: 0,
    expectedSeedValuesWithBye: [],
    expectedPositionsAssignedCount: 0,
    expectedRoundMatchUpsCounts: [4,4,2,1]
  })
});

it('can write to the file system', () => {
  const writeFile = process.env.TMX_TEST_FILES;
  const drawDefinition = drawEngine.getState();
  
  const drawType = CURTIS;
  const fileName = `${drawType}.json`;
  const dirPath = './src/engines/drawEngine/documentation/generated/';
  const output = `${dirPath}${fileName}`;
  if (writeFile) fs.writeFileSync(output, JSON.stringify(drawDefinition, null, 2));
})

function generateCurtis({
  drawSize,
  seedsCount,
  assignSeeds,
  participantsCount,
  seedAssignmentProfile={},
}) {
  const stage = MAIN;
  const drawType = CURTIS;
  
  drawEngine.reset();
  drawEngine.newDrawDefinition();
  drawEngine.setStageDrawSize({ stage, drawSize });
  drawEngine.generateDrawType({ drawType });
  
  const { structures: [mainStructure] } = drawEngine.getDrawStructures({ stage, stageSequence: 1});
  const { structureId: mainStructureId } = mainStructure;
 
  const { structures: [playoffStructure] } = drawEngine.getDrawStructures({ stage, stageSequence: 2});
  const { structureId: playoffStructureId } = { ...playoffStructure };
  
  const { structures: [consolation1stStructure] } = drawEngine.getDrawStructures({ stage: CONSOLATION, stageSequence: 1});
  const { structureId: consolation1stStructureId } = consolation1stStructure;
  
  const { structures: [consolation2ndStructure] } = drawEngine.getDrawStructures({ stage: CONSOLATION, stageSequence: 2});
  const { structureId: consolation2ndStructureId } = consolation2ndStructure;
  
  drawEngine.loadPolicy(SEEDING_POLICY);
  drawEngine.loadPolicy(AVOIDANCE_POLICY);
  
  const participants = generateRange(0, participantsCount)
    .map(i => ({participantId: `ko-uuid${i+1}`}));
  const participantIds = participants.map(p=>p.participantId);
    
  drawEngine.addDrawEntries({ stage, participantIds })
  drawEngine.initializeStructureSeedAssignments({ structureId: mainStructureId, seedsCount });
  
  assignSeeds = assignSeeds || seedsCount;
  if (assignSeeds > participantsCount) assignSeeds = participantsCount;
  generateRange(1, assignSeeds + 1).forEach(seedNumber => {
    const participantId = participants[seedNumber - 1].participantId;
    const seedValue = seedAssignmentProfile[seedNumber] || seedNumber;
    drawEngine.assignSeed({structureId: mainStructureId, seedNumber, seedValue, participantId});
  });

  drawEngine.automatedPositioning({ structureId: mainStructureId });

  return { mainStructureId, playoffStructureId, consolation1stStructureId, consolation2ndStructureId };
};
