import fs from 'fs';

import { drawEngine } from '../../../drawEngine';
import { generateRange } from '../../../utilities';
import { verifyStructure } from '../../tests/primitives/verifyStructure';

import SEEDING_POLICY from '../../../fixtures/SEEDING_USTA';
import AVOIDANCE_POLICY from '../../../fixtures/AVOIDANCE_COUNTRY';
import {
  MAIN,
  ROUND_ROBIN,
  WATERFALL,
} from '../../../constants/drawDefinitionConstants';

it('can generate and verify round robin structures', () => {
  let structureId;

  ({ structureId } = generateRoundRobin({
    drawSize: 8,
    groupSize: 4,
    seedsCount: 4,
    assignSeeds: 4,
    participantsCount: 6,
  }));

  verifyStructure({
    structureId,
    expectedSeeds: 4,
    expectedSeedsWithByes: 2,
    expectedByeAssignments: 2,
    expectedPositionsAssignedCount: 8,
    expectedRoundMatchUpsCounts: [4, 4, 4, 0],
    expectedSeedValuesWithBye: [1, 2],
  });

  ({ structureId } = generateRoundRobin({
    drawSize: 8,
    groupSize: 5,
    seedsCount: 4,
    assignSeeds: 4,
    participantsCount: 8,
  }));

  verifyStructure({
    structureId,
    expectedSeeds: 4,
    expectedSeedsWithByes: 2,
    expectedByeAssignments: 2,
    expectedPositionsAssignedCount: 10,
    expectedRoundMatchUpsCounts: [4, 4, 4, 4, 4, 0],
    expectedSeedValuesWithBye: [1, 2],
  });

  ({ structureId } = generateRoundRobin({
    drawSize: 40,
    groupSize: 7,
    seedsCount: 8,
    assignSeeds: 4,
    participantsCount: 40,
    seedingProfile: WATERFALL,
  }));

  verifyStructure({
    structureId,
    expectedSeeds: 4,
    expectedSeedsWithByes: 2,
    expectedByeAssignments: 2,
    expectedPositionsAssignedCount: 42,
    expectedSeedValuesWithBye: [1, 2],
  });

  ({ structureId } = generateRoundRobin({
    drawSize: 40,
    groupSize: 5,
    seedsCount: 16,
    assignSeeds: 16,
    participantsCount: 37,
    seedingProfile: WATERFALL,
  }));

  verifyStructure({
    structureId,
    expectedSeeds: 16,
    expectedSeedsWithByes: 3,
    expectedByeAssignments: 3,
    expectedPositionsAssignedCount: 40,
    expectedSeedValuesWithBye: [1, 2, 3],
  });

  ({ structureId } = generateRoundRobin({
    drawSize: 40,
    groupSize: 5,
    seedsCount: 37,
    assignSeeds: 37,
    participantsCount: 37,
    seedingProfile: WATERFALL,
  }));

  verifyStructure({
    structureId,
    expectedSeeds: 37,
    expectedSeedsWithByes: 3,
    expectedByeAssignments: 3,
    expectedPositionsAssignedCount: 40,
    expectedSeedValuesWithBye: [1, 2, 3],
  });

  /*
  const { upcomingMatchUps, pendingMatchUps } = drawEngine.drawMatchUps();
  let { matchUpId } = upcomingMatchUps.pop();
  
  // TODO: test advancing position
  drawEngine.setMatchUpStatus({ matchUpId });
  */
});

it('can write to the file system', () => {
  generateRoundRobin({
    drawSize: 5,
    groupSize: 5,
    seedsCount: 0,
    assignSeeds: 0,
    participantsCount: 5,
  });

  const writeFile = process.env.TMX_TEST_FILES;
  const { drawDefinition } = drawEngine.getState();
  const drawType = ROUND_ROBIN;
  const fileName = `${drawType}.json`;
  const dirPath = './src/drawEngine/documentation/generated/';
  const output = `${dirPath}${fileName}`;
  if (writeFile)
    fs.writeFileSync(output, JSON.stringify(drawDefinition, null, 2));
});

function generateRoundRobin({
  drawSize,
  groupSize,
  seedsCount,
  participantsCount,
  assignSeeds,
  seedingProfile,
  seedAssignmentProfile = {},
}) {
  let errors = [];
  const stage = MAIN;
  const drawType = ROUND_ROBIN;

  drawEngine.reset();
  drawEngine.newDrawDefinition();

  drawEngine.attachPolicy({ policyDefinition: SEEDING_POLICY });
  drawEngine.attachPolicy({ policyDefinition: AVOIDANCE_POLICY });

  drawEngine.setStageDrawSize({ stage, drawSize });
  drawEngine.generateDrawType({
    drawType,
    seedingProfile,
    structureOptions: { groupSize, groupSizeLimit: 8 },
  });

  const {
    structures: [structure],
  } = drawEngine.getDrawStructures({ stage, stageSequence: 1 });
  const { structureId } = structure;

  const participants = generateRange(0, participantsCount).map(i => ({
    participantId: `ko-uuid${i + 1}`,
  }));
  const participantIds = participants.map(p => p.participantId);

  const { error: entriesError } = drawEngine.addDrawEntries({
    stage,
    participantIds,
  });
  if (entriesError) errors.push({ entriesError });

  const {
    error: seedInitializationError,
  } = drawEngine.initializeStructureSeedAssignments({
    structureId,
    seedsCount,
  });
  if (seedInitializationError) errors.push({ seedInitializationError });

  assignSeeds = assignSeeds || seedsCount;
  generateRange(1, assignSeeds + 1).forEach(seedNumber => {
    const participantId = participants[seedNumber - 1].participantId;
    const seedValue = seedAssignmentProfile[seedNumber] || seedNumber;
    const { error: seedAssignmentError } = drawEngine.assignSeed({
      structureId,
      seedNumber,
      seedValue,
      participantId,
    });
    if (seedAssignmentError) errors.push({ seedAssignmentError });
  });

  const { errors: positioningErrors } = drawEngine.automatedPositioning({
    structureId,
  });
  if (positioningErrors) errors = errors.concat(...positioningErrors);

  if (errors.length) console.log(errors);
  return { structureId, errors };
}
