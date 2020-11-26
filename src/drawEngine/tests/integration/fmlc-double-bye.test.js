import { verifyStructure } from '../../tests/primitives/verifyStructure';
import { verifyMatchUps } from '../../tests/primitives/verifyMatchUps';

import { generateFMLC } from '../../tests/primitives/fmlc';

it('can generate FMLC with double-byes in consolation', () => {
  const drawSize = 32;
  const seedsCount = 8;
  const participantsCount = 17;

  const { mainStructureId, consolationStructureId } = generateFMLC({
    drawSize,
    seedsCount,
    participantsCount,
  });

  verifyStructure({
    structureId: mainStructureId,
    expectedSeeds: 8,
    expectedSeedsWithByes: 8,
    expectedByeAssignments: 15,
    expectedPositionsAssignedCount: 32,
    expectedSeedValuesWithBye: [1, 2, 3, 4, 5, 6, 7, 8],
  });

  verifyMatchUps({
    structureId: mainStructureId,
    expectedRoundPending: [0, 1],
    expectedRoundUpcoming: [1, 7],
    expectedRoundCompleted: [0, 0],
  });

  verifyStructure({
    structureId: consolationStructureId,
    expectedSeeds: 0,
    expectedSeedsWithByes: 0,
    expectedByeAssignments: 15,
    expectedPositionsAssignedCount: 15,
    expectedSeedValuesWithBye: [],
  });

  verifyMatchUps({
    structureId: consolationStructureId,
    expectedRoundPending: [0, 0, 0, 0],
    expectedRoundUpcoming: [0, 0],
    expectedRoundCompleted: [0, 0],
    requireParticipants: false,
  });

  verifyMatchUps({
    structureId: consolationStructureId,
    expectedRoundPending: [0, 0, 0, 0],
    expectedRoundUpcoming: [0, 0],
    expectedRoundCompleted: [0, 0],
    requireParticipants: true, // requires that drawPositions be assigned to participantIds
  });
});

it('can generate FMLC with double-byes in consolation', () => {
  const drawSize = 32;
  const seedsCount = 8;
  const participantsCount = 18;

  const { mainStructureId, consolationStructureId } = generateFMLC({
    drawSize,
    seedsCount,
    participantsCount,
  });

  verifyStructure({
    structureId: mainStructureId,
    expectedSeeds: 8,
    expectedSeedsWithByes: 8,
    expectedByeAssignments: 14,
    expectedPositionsAssignedCount: 32,
    expectedSeedValuesWithBye: [1, 2, 3, 4, 5, 6, 7, 8],
  });

  verifyMatchUps({
    structureId: mainStructureId,
    expectedRoundPending: [0, 2],
    expectedRoundUpcoming: [2, 6],
    expectedRoundCompleted: [0, 0],
  });

  verifyStructure({
    structureId: consolationStructureId,
    expectedSeeds: 0,
    expectedSeedsWithByes: 0,
    expectedByeAssignments: 14,
    expectedPositionsAssignedCount: 14,
    expectedSeedValuesWithBye: [],
  });

  verifyMatchUps({
    structureId: consolationStructureId,
    expectedRoundPending: [0, 0, 0, 0],
    expectedRoundUpcoming: [0, 0],
    expectedRoundCompleted: [0, 0],
    requireParticipants: false,
  });

  verifyMatchUps({
    structureId: consolationStructureId,
    expectedRoundPending: [0, 0, 0, 1],
    expectedRoundUpcoming: [0, 0],
    expectedRoundCompleted: [0, 0],
    requireParticipants: true, // requires that drawPositions be assigned to participantIds
  });
});
