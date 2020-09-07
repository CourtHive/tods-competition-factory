import fs from 'fs';
import { drawEngine } from 'competitionFactory/drawEngine';
import { verifyStructure } from 'competitionFactory/drawEngine/tests/primitives/verifyStructure';
import { generateFeedIn, generateDrawStructure } from 'competitionFactory/drawEngine/tests/primitives/generateDrawStructure';

import { FEED_IN } from 'competitionFactory/constants/drawDefinitionConstants';

it('can generate and verify feed-in structures', () => {
  let structureId;

  ({ structureId } = generateFeedIn({
    drawSize: 12,
    participantsCount: 12
  }));

  verifyStructure({
    structureId,
    expectedRoundMatchUpsCounts: [4,4,2,1]
  });

  ({ structureId } = generateFeedIn({
    drawSize: 11,
    participantsCount: 11
  }));
  
  verifyStructure({
    structureId,
    expectedRoundMatchUpsCounts: [4,2,2,1]
  });

  ({ structureId } = generateFeedIn({
    drawSize: 13,
    participantsCount: 13
  }));

  verifyStructure({
    structureId,
    expectedRoundMatchUpsCounts: [4,4,2,1,1]
  });

  ({ structureId } = generateFeedIn({
    drawSize: 11,
    participantsCount: 11
  }));
  
  verifyStructure({
    structureId,
    expectedRoundMatchUpsCounts: [4,2,2,1]
  });

  ({ structureId } = generateFeedIn({
    drawSize: 28,
    seedsCount: 4,
    assignSeeds: 4,
    participantsCount: 28
  }));

  verifyStructure({
    structureId,
    expectedSeeds: 4,
    expectedSeedsWithByes: 0,
    expectedByeAssignments: 0,
    expectedSeedValuesWithBye: [],
    expectedPositionsAssignedCount: 28,
    expectedRoundMatchUpsCounts: [8,8,4,4,2,1]
  });

  ({ structureId } = generateFeedIn({
    drawSize: 34,
    seedsCount: 4,
    assignSeeds: 4,
    participantsCount: 32
  }));
  
  verifyStructure({
    structureId,
    expectedSeeds: 4,
    expectedSeedsWithByes: 2,
    expectedByeAssignments: 2,
    expectedSeedValuesWithBye: [3,4],
    expectedPositionsAssignedCount: 34,
    expectedRoundMatchUpsCounts: [16,8,4,2,2,1]
  });
});

it('can generate large feedIn with many BYEs', () => {
  let structureId;
  
  ({ structureId } = generateFeedIn({
    drawSize: 63,
    seedsCount: 33,
    assignSeeds: 33,
    participantsCount: 50,
    seedAssignmentProfile: { 5: 4 }
  }));
  
  verifyStructure({
    structureId,
    expectedSeeds: 33,
    expectedSeedsWithByes: 2,
    expectedByeAssignments: 13,
    expectedSeedValuesWithBye: [32,33],
    expectedPositionsAssignedCount: 63,
    expectedRoundMatchUpsCounts: [16,16,8,8,4,4,2,2,1]
  });
});

it('can generate large feedIn with many BYEs', () => {
  let structureId;

  ({ structureId } = generateDrawStructure({
    drawSize: 12,
    drawType: FEED_IN,
    participantsCount: 10
  }));

  drawEngine.automatedPositioning({structureId});

  verifyStructure({
    structureId,
    expectedByeAssignments: 2,
    expectedPositionsAssignedCount: 12,
    expectedRoundMatchUpsCounts: [4,4,2,1]
  });

  // TODO: test placing BYES in a FEED IN with 10 players in 12 drawSize (8 baseDrawSize)
});

it('can write to the file system', () => {
  const writeFile = process.env.TMX_TEST_FILES;
  const drawDefinition = drawEngine.getState();
  
  const drawType = FEED_IN;
  const fileName = `${drawType}.json`;
  const dirPath = './src/engines/drawEngine/documentation/generated/';
  const output = `${dirPath}${fileName}`;
  if (writeFile) fs.writeFileSync(output, JSON.stringify(drawDefinition, null, 2));
})
