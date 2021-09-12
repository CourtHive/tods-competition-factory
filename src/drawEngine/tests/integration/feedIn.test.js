import { generateFeedIn } from '../../tests/primitives/generateDrawStructure';
import { verifyStructure } from '../../tests/primitives/verifyStructure';
import { mocksEngine } from '../../..';

import { FEED_IN } from '../../../constants/drawDefinitionConstants';

it('can accurately generate sideNumbers', () => {
  const { structureId, drawDefinition } = generateFeedIn({
    drawSize: 34,
    seedsCount: 4,
    assignSeeds: 4,
    participantsCount: 32,
  });

  verifyStructure({
    structureId,
    drawDefinition,
    expectedSeeds: 4,
    expectedSeedsWithByes: 2,
    expectedByeAssignments: 2,
    expectedSeedValuesWithBye: [3, 4],
    expectedPositionsAssignedCount: 34,
    expectedRoundMatchUpsCounts: [16, 8, 4, 2, 2, 1],
  });
});

it('can generate and verify feed-in structures', () => {
  let structureId, drawDefinition;

  ({ structureId, drawDefinition } = generateFeedIn({
    drawSize: 12,
    participantsCount: 12,
  }));

  verifyStructure({
    structureId,
    drawDefinition,
    expectedRoundMatchUpsCounts: [4, 4, 2, 1],
  });

  ({ structureId, drawDefinition } = generateFeedIn({
    drawSize: 11,
    participantsCount: 11,
  }));

  verifyStructure({
    structureId,
    drawDefinition,
    expectedRoundMatchUpsCounts: [4, 2, 2, 1],
  });

  ({ structureId, drawDefinition } = generateFeedIn({
    drawSize: 13,
    participantsCount: 13,
  }));

  verifyStructure({
    structureId,
    drawDefinition,
    expectedRoundMatchUpsCounts: [4, 4, 2, 1, 1],
  });

  ({ structureId, drawDefinition } = generateFeedIn({
    drawSize: 11,
    participantsCount: 11,
  }));

  verifyStructure({
    structureId,
    drawDefinition,
    expectedRoundMatchUpsCounts: [4, 2, 2, 1],
  });

  ({ structureId, drawDefinition } = generateFeedIn({
    drawSize: 28,
    seedsCount: 4,
    assignSeeds: 4,
    participantsCount: 28,
  }));

  verifyStructure({
    structureId,
    drawDefinition,
    expectedSeeds: 4,
    expectedSeedsWithByes: 0,
    expectedByeAssignments: 0,
    expectedSeedValuesWithBye: [],
    expectedPositionsAssignedCount: 28,
    expectedRoundMatchUpsCounts: [8, 8, 4, 4, 2, 1],
  });

  ({ structureId, drawDefinition } = generateFeedIn({
    drawSize: 34,
    seedsCount: 4,
    assignSeeds: 4,
    participantsCount: 32,
  }));

  verifyStructure({
    structureId,
    drawDefinition,
    expectedSeeds: 4,
    expectedSeedsWithByes: 2,
    expectedByeAssignments: 2,
    expectedSeedValuesWithBye: [3, 4],
    expectedPositionsAssignedCount: 34,
    expectedRoundMatchUpsCounts: [16, 8, 4, 2, 2, 1],
  });
});

it('can generate large feedIn with many BYEs', () => {
  const { structureId, drawDefinition } = generateFeedIn({
    drawSize: 63,
    seedsCount: 33,
    assignSeeds: 33,
    participantsCount: 50,
    seedAssignmentProfile: { 5: 4 },
  });

  verifyStructure({
    structureId,
    drawDefinition,
    expectedSeeds: 33,
    expectedSeedsWithByes: 2,
    expectedByeAssignments: 13,
    expectedSeedValuesWithBye: [32, 33],
    expectedPositionsAssignedCount: 63,
    expectedRoundMatchUpsCounts: [16, 16, 8, 8, 4, 4, 2, 2, 1],
  });
});

it('can generate large feedIn with many BYEs', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 12, participantsCount: 10, drawType: FEED_IN }],
  });

  const drawDefinition = tournamentRecord.events[0].drawDefinitions[0];
  const structureId = drawDefinition.structures[0].structureId;

  verifyStructure({
    structureId,
    drawDefinition,
    expectedByeAssignments: 2,
    expectedPositionsAssignedCount: 12,
    expectedRoundMatchUpsCounts: [4, 4, 2, 1],
  });
});
