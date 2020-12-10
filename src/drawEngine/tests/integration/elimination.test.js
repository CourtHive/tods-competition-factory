import fs from 'fs';

import { drawEngine } from '../..';
import { generateRange, instanceCount, unique } from '../../../utilities';
import { verifyStructure } from '../primitives/verifyStructure';
import { generateDrawStructure } from '../primitives/generateDrawStructure';
import {
  completeMatchUp,
  verifyMatchUps,
  verifySideNumbers,
} from '../primitives/verifyMatchUps';

import { ELIMINATION } from '../../../constants/drawDefinitionConstants';

it('can generate and verify elmination structures', () => {
  let structureId;

  ({ structureId } = generateDrawStructure({
    drawSize: 32,
    seedsCount: 8,
    participantsCount: 17,
    assignSeeds: 5,
    matchUpFormat: 'SET3-S:6/TB',
    seedAssignmentProfile: { 5: 4 },
  }));

  verifyStructure({
    structureId,
    expectedSeeds: 5,
    expectedSeedsWithByes: 5,
    expectedByeAssignments: 15,
    expectedPositionsAssignedCount: 32,
    expectedSeedValuesWithBye: [1, 2, 3, 4, 4],
  });

  ({ structureId } = generateDrawStructure({
    drawSize: 32,
    seedsCount: 8,
    participantsCount: 30,
    assignSeeds: 8,
  }));

  verifyStructure({
    structureId,
    expectedSeeds: 8,
    expectedSeedsWithByes: 2,
    expectedByeAssignments: 2,
    expectedSeedValuesWithBye: [1, 2],
    expectedPositionsAssignedCount: 32,
    hierarchyVerification: [
      {
        navigationProfile: [0, 0, 0, 0, 0],
        attribute: 'drawPosition',
        result: 1,
      },
      {
        navigationProfile: [0, 0, 0, 0, 1],
        attribute: 'drawPosition',
        result: 2,
      },
      { navigationProfile: [], attribute: 'roundNumber', result: 5 },
      { navigationProfile: [], attribute: 'matchUpId', existance: true },
      {
        navigationProfile: [],
        result: { roundNumber: 5, roundPosition: 1 },
      },
    ],
  });

  ({ structureId } = generateDrawStructure({
    drawSize: 2,
    participantsCount: 2,
    matchUpFormat: 'SET3-S:6/TB',
  }));

  verifyStructure({
    structureId,
    expectedSeeds: 0,
    expectedSeedsWithByes: 0,
    expectedByeAssignments: 0,
    expectedPositionsAssignedCount: 2,
    expectedSeedValuesWithBye: [],
  });

  verifyMatchUps({
    structureId,
    expectedRoundPending: [0],
    expectedRoundUpcoming: [1],
    expectedRoundCompleted: [0],
  });

  // const { drawDefinition } = drawEngine.getState();
  // console.log(JSON.stringify(drawDefinition, undefined, 2));
});

it('can write to the file system', () => {
  const writeFile = process.env.TMX_TEST_FILES;
  const { drawDefinition } = drawEngine.getState();
  const drawType = ELIMINATION;
  const fileName = `${drawType}.json`;
  const dirPath = './src/drawEngine/documentation/generated/';
  const output = `${dirPath}${fileName}`;
  if (writeFile)
    fs.writeFileSync(output, JSON.stringify(drawDefinition, undefined, 2));
});

it('will vary bye distribution', () => {
  const iterations = generateRange(0, 10).map(() => {
    const { structureId } = generateDrawStructure({
      drawSize: 32,
      seedsCount: 8,
      participantsCount: 26,
      assignSeeds: 5,
    });

    const { byeAssignedDrawPositions, filteredQuarters } = verifyStructure({
      structureId,
      expectedSeeds: 5,
      expectedByeAssignments: 6,
      expectedPositionsAssignedCount: 32,
      expectedSeedValuesWithBye: [1, 2, 3, 4, 5],
    });

    const byesHash = byeAssignedDrawPositions.join('|');
    const quartersHash = filteredQuarters.map(q => q.join('|')).join('~');

    return { byesHash, quartersHash };
  });

  const byesIterations = iterations.map(i => i.byesHash);
  const quartersIterations = iterations.map(i => i.quartersHash);

  expect(byesIterations.length).not.toEqual(unique(byesIterations).length);
  expect(quartersIterations.length).not.toEqual(
    unique(quartersIterations).length
  );
});

it('can advance participants in elmination structures', () => {
  let structureId;

  ({ structureId } = generateDrawStructure({
    drawSize: 4,
    participantsCount: 4,
  }));

  verifyStructure({
    structureId,
    expectedPositionsAssignedCount: 4,
  });

  verifyMatchUps({
    structureId,
    expectedRoundPending: [0, 1],
    expectedRoundUpcoming: [2, 0],
    expectedRoundCompleted: [0, 0],
  });

  completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 1,
    winningSide: 1,
  });
  completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 2,
    winningSide: 2,
  });

  verifyMatchUps({
    structureId,
    expectedRoundPending: [0, 0],
    expectedRoundUpcoming: [0, 1],
    expectedRoundCompleted: [2, 0],
  });

  completeMatchUp({
    structureId,
    roundNumber: 2,
    roundPosition: 1,
    winningSide: 1,
  });

  verifyMatchUps({
    structureId,
    expectedRoundPending: [0, 0],
    expectedRoundUpcoming: [0, 0],
    expectedRoundCompleted: [2, 1],
  });

  ({ structureId } = generateDrawStructure({
    drawSize: 16,
    participantsCount: 15,
  }));

  verifyStructure({
    structureId,
    expectedPositionsAssignedCount: 16,
  });

  verifyMatchUps({
    structureId,
    expectedRoundPending: [0, 4],
    expectedRoundUpcoming: [7, 0],
    expectedRoundCompleted: [0, 0],
  });

  completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 2,
    winningSide: 2,
  });

  verifyMatchUps({
    structureId,
    expectedRoundPending: [0, 3],
    expectedRoundUpcoming: [6, 1],
    expectedRoundCompleted: [1, 0],
  });

  completeMatchUp({
    structureId,
    roundNumber: 2,
    roundPosition: 1,
    winningSide: 1,
  });

  verifyMatchUps({
    structureId,
    expectedRoundPending: [0, 3],
    expectedRoundUpcoming: [6, 0],
    expectedRoundCompleted: [1, 1],
  });
});

it('can reliably generate sideNumbers', () => {
  const { structureId } = generateDrawStructure({
    drawSize: 16,
    participantsCount: 16,
  });

  verifyStructure({
    structureId,
    expectedPositionsAssignedCount: 16,
  });

  completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 2,
    winningSide: 1,
  });

  completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 4,
    winningSide: 1,
  });

  completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 5,
    winningSide: 2,
  });

  completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 8,
    winningSide: 1,
  });

  let expectedDrawPositions = {
    '2': [
      [
        [3, undefined],
        [undefined, 2],
      ],
      [
        [7, undefined],
        [undefined, 2],
      ],
      [
        [10, undefined],
        [1, undefined],
      ],
      [
        [15, undefined],
        [undefined, 2],
      ],
    ],
  };
  verifySideNumbers({ structureId, expectedDrawPositions });

  completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 1,
    winningSide: 1,
  });

  completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 3,
    winningSide: 2,
  });

  completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 6,
    winningSide: 2,
  });

  completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 7,
    winningSide: 1,
  });

  expectedDrawPositions = {
    '2': [
      [
        [1, 3],
        [1, 2],
      ],
      [
        [6, 7],
        [1, 2],
      ],
      [
        [10, 12],
        [1, 2],
      ],
      [
        [13, 15],
        [1, 2],
      ],
    ],
  };
  verifySideNumbers({ structureId, expectedDrawPositions });
});

it('can return participantIdMatchUps', () => {
  const { structureId } = generateDrawStructure({
    drawSize: 16,
    participantsCount: 14,
  });

  verifyStructure({
    structureId,
    expectedPositionsAssignedCount: 16,
  });

  completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 2,
    winningSide: 1,
  });

  completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 4,
    winningSide: 1,
  });

  completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 5,
    winningSide: 2,
  });

  completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 8,
    winningSide: 1,
  });

  completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 1,
    winningSide: 1,
  });

  completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 3,
    winningSide: 2,
  });

  completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 6,
    winningSide: 2,
  });

  completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 7,
    winningSide: 1,
  });

  const { participantIdMatchUps } = drawEngine.getParticipantIdMatchUps();
  const participantIds = Object.keys(participantIdMatchUps);
  expect(participantIds.length).toEqual(14);

  const matchUpsCount = participantIds.map(
    participantId => participantIdMatchUps[participantId].length
  );

  const matchUpsCountInstances = instanceCount(matchUpsCount);
  expect(matchUpsCountInstances[1]).toEqual(6);
  expect(matchUpsCountInstances[2]).toEqual(8);
});
