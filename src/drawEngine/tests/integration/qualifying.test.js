import fs from 'fs';

import { drawEngine } from '../../../drawEngine';

import { verifyStructure } from '../../tests/primitives/verifyStructure';
import { generateDrawStructure } from '../../tests/primitives/generateDrawStructure';
import { generateEliminationWithQualifying } from '../../tests/primitives/generateEliminationWithQualifying';

import {
  QUALIFYING,
  ELIMINATION,
} from '../../../constants/drawDefinitionConstants';

it('can generate and verify qualifying structures', () => {
  const { structureId } = generateDrawStructure({
    drawSize: 32,
    seedsCount: 8,
    assignSeeds: 5,
    stage: QUALIFYING,
    qualifyingRound: 2,
    participantsCount: 17,
    drawType: ELIMINATION,
    seedAssignmentProfile: { 5: 4 },
  });

  verifyStructure({
    structureId,
    expectedSeeds: 5,
    expectedSeedsWithByes: 5,
    expectedByeAssignments: 15,
    expectedPositionsAssignedCount: 32,
    expectedSeedValuesWithBye: [1, 2, 3, 4, 4],
    expectedRoundMatchUpsCounts: [16, 8, 0, 0, 0],
  });
});

it('can generate qualifying and linked elimination structure', () => {
  const {
    qualifyingStructureId,
    mainStructureId,
  } = generateEliminationWithQualifying({
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
    expectedPositionsAssignedCount: 32,
    expectedRoundMatchUpsCounts: [16, 8, 4, 2, 1],
  });
});

it('can write to the file system', () => {
  const writeFile = process.env.TMX_TEST_FILES;
  const { drawDefinition } = drawEngine.getState();
  const drawType = QUALIFYING;
  const fileName = `${drawType}.json`;
  const dirPath = './src/drawEngine/documentation/generated/';
  const output = `${dirPath}${fileName}`;
  if (writeFile)
    fs.writeFileSync(output, JSON.stringify(drawDefinition, null, 2));
});
