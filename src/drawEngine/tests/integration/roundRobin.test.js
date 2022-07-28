import { verifyStructure } from '../../tests/primitives/verifyStructure';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { generateRange } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import { drawEngine } from '../../sync';

import SEEDING_POLICY from '../../../fixtures/policies/POLICY_SEEDING_USTA';
import {
  MAIN,
  ROUND_ROBIN,
  WATERFALL,
} from '../../../constants/drawDefinitionConstants';

const scenarios = [
  {
    drawProfile: {
      structureOptions: { groupSize: 4 },
      participantsCount: 6,
      seedsCount: 4,
      drawSize: 8,
    },
    expectation: {
      expectedSeedsWithByes: 2,
      byesCount: 2,
      assignedPositionsCount: 8,
      expectedRoundMatchUpsCounts: [4, 4, 4, 0],
      expectedSeedValuesWithBye: [1, 2],
    },
  },
  /*
  {
    drawProfile: {
      structureOptions: { groupSize: 5 },
      participantsCount: 8,
      seedsCount: 4,
      drawSize: 8,
    },
    expectation: {
      expectedSeedsWithByes: 2,
      byesCount: 2,
      assignedPositionsCount: 10,
      expectedRoundMatchUpsCounts: [4, 4, 4, 4, 4],
      expectedSeedValuesWithBye: [1, 2],
    },
  },
  {
    drawProfile: {
      seedingProfile: { positioning: WATERFALL },
      structureOptions: { groupSize: 7 },
      participantsCount: 40,
      seedsCount: 8,
      drawSize: 40,
    },
    expectation: {
      expectedSeedsWithByes: 2,
      byesCount: 2,
      assignedPositionsCount: 42,
      expectedSeedValuesWithBye: [1, 2],
    },
  },
  {
    drawProfile: {
      seedingProfile: { positioning: WATERFALL },
      structureOptions: { groupSize: 5 },
      participantsCount: 37,
      seedsCount: 16,
      drawSize: 40,
    },
    expectation: {
      expectedSeedsWithByes: 3,
      byesCount: 3,
      assignedPositionsCount: 40,
      expectedSeedValuesWithBye: [1, 2, 3],
    },
  },
  {
    drawProfile: {
      seedingProfile: { positioning: WATERFALL },
      structureOptions: { groupSize: 5 },
      participantsCount: 37,
      seedsCount: 37,
      drawSize: 40,
    },
    expectation: {
      expectedSeedsWithByes: 3,
      byesCount: 3,
      assignedPositionsCount: 40,
      expectedSeedValuesWithBye: [1, 2, 3],
    },
  },
  */
];

it.only.each(scenarios)('can generate and verify', (scenario) => {
  const { drawProfile, expectation } = scenario;
  const result = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { ...drawProfile, enforcePolicyLimits: false, drawType: ROUND_ROBIN },
    ],
  });
  const structure =
    result.tournamentRecord.events[0].drawDefinitions[0].structures[0];
  const { positionAssignments } = getPositionAssignments({ structure });
  const assignedPositions = positionAssignments.filter(
    (assignment) => assignment.bye || assignment.participantId
  );
  console.log({ assignedPositions });
  // expect(assignedPositions.length).toEqual(expectation.assignedPositionsCount);
  const byePositions = positionAssignments.filter(
    (assignment) => assignment.bye
  );
  if (byePositions.length !== expectation.byesCount) {
    console.log({ drawProfile, expectation });
  }
  // expect(byePositions.length).toEqual(expectation.byesCount);

  const seedAssignments = structure.seedAssignments;
  const assignedSeedPositions = seedAssignments.filter(
    (assignment) => assignment.participantId
  );
  expect(assignedSeedPositions.length).toEqual(drawProfile.seedsCount);
});

it('can generate and verify round robin structures', () => {
  let { structureId } = generateRoundRobin({
    drawSize: 8,
    groupSize: 4,
    seedsCount: 4,
    assignSeeds: 4,
    participantsCount: 6,
  });

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
    expectedRoundMatchUpsCounts: [4, 4, 4, 4, 4],
    expectedSeedValuesWithBye: [1, 2],
  });

  ({ structureId } = generateRoundRobin({
    seedingProfile: { positioning: WATERFALL },
    participantsCount: 40,
    assignSeeds: 4,
    seedsCount: 8,
    drawSize: 40,
    groupSize: 7,
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
    seedingProfile: { positioning: WATERFALL },
    participantsCount: 37,
    assignSeeds: 16,
    seedsCount: 16,
    drawSize: 40,
    groupSize: 5,
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

function generateRoundRobin({
  drawSize,
  groupSize,
  seedsCount,
  participantsCount,
  assignSeeds,
  seedingProfile,
  seedAssignmentProfile = {},
}) {
  const stage = MAIN;
  const drawType = ROUND_ROBIN;

  drawEngine.reset();
  drawEngine.newDrawDefinition();

  drawEngine.attachPolicies({ policyDefinitions: SEEDING_POLICY });

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

  const participants = generateRange(0, participantsCount).map((i) => ({
    participantId: `ko-uuid${i + 1}`,
  }));
  const participantIds = participants.map((p) => p.participantId);

  const { error: entriesError } = drawEngine.addDrawEntries({
    stage,
    participantIds,
  });
  if (entriesError) console.log({ entriesError });

  const { error: seedInitializationError } =
    drawEngine.initializeStructureSeedAssignments({
      structureId,
      seedsCount,
    });
  if (seedInitializationError) console.log({ seedInitializationError });

  assignSeeds = assignSeeds || seedsCount;
  generateRange(1, assignSeeds + 1).forEach((seedNumber) => {
    const participantId = participants[seedNumber - 1].participantId;
    const seedValue = seedAssignmentProfile[seedNumber] || seedNumber;
    const { error: seedAssignmentError } = drawEngine.assignSeed({
      structureId,
      seedNumber,
      seedValue,
      participantId,
    });
    if (seedAssignmentError) {
      console.log({ seedAssignmentError });
    }
  });

  const { error: positioningError } = drawEngine.automatedPositioning({
    structureId,
  });
  if (positioningError) console.log({ positioningError });

  return { structureId };
}
