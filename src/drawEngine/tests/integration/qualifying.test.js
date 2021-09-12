import { generateEliminationWithQualifying } from '../../tests/primitives/generateEliminationWithQualifying';
import { verifyStructure } from '../../tests/primitives/verifyStructure';
import { mocksEngine } from '../../..';

import {
  QUALIFYING,
  SINGLE_ELIMINATION,
} from '../../../constants/drawDefinitionConstants';

it('can generate and verify qualifying structures', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      seedsCount: 8,
      stage: QUALIFYING,
      qualifyingRound: 2,
      participantsCount: 17,
      drawType: SINGLE_ELIMINATION,
    },
  ];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    eventProfiles: [{ drawProfiles }],
  });

  const drawDefinition = tournamentRecord.events[0].drawDefinitions[0];
  const structure = drawDefinition.structures[0];
  const structureId = structure.structureId;

  verifyStructure({
    structureId,
    drawDefinition,
    expectedSeeds: 4,
    expectedSeedsWithByes: 4,
    expectedByeAssignments: 15,
    expectedPositionsAssignedCount: 32,
    expectedSeedValuesWithBye: [1, 2, 3, 4],
    expectedRoundMatchUpsCounts: [16, 8, 0, 0, 0],
  });
});

it('can generate qualifying and linked elimination structure', () => {
  const { qualifyingStructureId, mainStructureId, drawDefinition } =
    generateEliminationWithQualifying({
      qualifyingDrawSize: 16,
      qualifyingPositions: 8,
      qualifyingSeedsCount: 4,
      qualifyingParticipantsCount: 15,
      qualifyingSeedAssignmentProfile: {},

      alternatesCount: 5,

      drawSize: 32,
      mainSeedsCount: 8,
      assignMainSeeds: 8,
      mainParticipantsCount: 32,
      mainSeedAssignmentProfile: {},
    });

  verifyStructure({
    drawDefinition,
    structureId: qualifyingStructureId,
    expectedSeeds: 4,
    expectedSeedsWithByes: 1,
    expectedByeAssignments: 1,
    expectedSeedValuesWithBye: [1],
    expectedPositionsAssignedCount: 16,
    expectedRoundMatchUpsCounts: [8, 0, 0, 0],
  });

  verifyStructure({
    structureId: mainStructureId,
    expectedSeeds: 8,
    expectedSeedsWithByes: 0,
    expectedByeAssignments: 0,
    expectedSeedValuesWithBye: [],
    expectedQualifierAssignments: 8,
    expectedPositionsAssignedCount: 32,
    expectedRoundMatchUpsCounts: [16, 8, 4, 2, 1],
  });
});
