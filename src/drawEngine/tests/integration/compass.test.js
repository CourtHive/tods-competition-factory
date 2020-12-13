import fs from 'fs';
import { generateRange } from '../../../utilities';
import { drawEngine } from '../../../drawEngine';

import { MAIN, COMPASS } from '../../../constants/drawDefinitionConstants';
import { BYE } from '../../../constants/matchUpStatusConstants';
import SEEDING_POLICY from '../../../fixtures/seeding/SEEDING_ITF';

it('can generate COMPASS and fill all drawPositions', () => {
  const writeFile = process.env.TMX_TEST_FILES;

  let drawSize, seedsCount, participantsCount;
  let expectedCompassByes, expectedByeDrawPositions, expectedByeRemoval;

  drawSize = 32;
  seedsCount = 8;
  participantsCount = 30; // we will have 2 BYEs
  expectedCompassByes = {
    EAST: { byeDrawPositions: [2, 31], roundPositions: [1, 16] },
    WEST: { byeDrawPositions: [1, 16], roundPositions: [1, 8] },
    SOUTH: { byeDrawPositions: [1, 8], roundPositions: [1, 4] },
    SOUTHEAST: { byeDrawPositions: [1, 4], roundPositions: [1, 2] },
  };
  expectedByeDrawPositions = {
    EAST: { advancedFiltered: [2, 1, 8], unadvancedFiltered: 0 },
    WEST: { advancedFiltered: [2, 1, 4], unadvancedFiltered: 0 },
    SOUTH: { advancedFiltered: [2, 1, 2], unadvancedFiltered: 0 },
    SOUTHEAST: {
      includeByeMatchUps: true,
      advancedFiltered: [0],
      pendingAdvancedLength: 1,
      pendingAdvancedRoundPosition: 1,
      pendingAdvancedDrawPositions: [2, 3],
      unadvancedPending: 3,
      pendingUnadvancedDrawPositions: [
        [1, 2],
        [3, 4],
        [undefined, undefined],
      ],
      unadvancedFiltered: 0,
    },
  };
  expectedByeRemoval = {
    initialByeMatchUpCount: 8,
    clearExpect: [
      [0, 4],
      [1, 0],
    ],
  };

  generateCompass({
    drawSize,
    seedsCount,
    participantsCount,
    expectedByeRemoval,
    expectedCompassByes,
    expectedByeDrawPositions,
  });

  drawSize = 32;
  seedsCount = 8;
  participantsCount = 28; // we will have 4 BYEs
  expectedCompassByes = {
    EAST: { byeDrawPositions: [2, 10, 23, 31], roundPositions: [1, 5, 12, 16] },
    WEST: { byeDrawPositions: [1, 5, 12, 16], roundPositions: [1, 3, 6, 8] },
    SOUTH: { byeDrawPositions: [1, 3, 6, 8], roundPositions: [1, 2, 3, 4] },
    SOUTHEAST: { byeDrawPositions: [1, 2, 3, 4], roundPositions: [1, 2, 1] },
  };
  expectedByeDrawPositions = {
    EAST: { advancedFiltered: [4, 1, 3], unadvancedFiltered: 0 },
    WEST: { advancedFiltered: [4, 1, 2], unadvancedFiltered: 0 },
    SOUTH: { advancedFiltered: [0], unadvancedFiltered: 0 },
    SOUTHEAST: {
      includeByeMatchUps: true,
      advancedFiltered: [0],
      pendingAdvancedLength: 0,
      pendingAdvancedRoundPosition: undefined,
      pendingAdvancedDrawPositions: undefined,
      unadvancedFiltered: 0,
      unadvancedPending: 1,
    },
  };
  expectedByeRemoval = {
    initialByeMatchUpCount: 15,
    clearExpect: [
      [0, 12],
      [1, 9],
      [2, 5],
    ],
  };

  generateCompass({
    drawSize,
    seedsCount,
    participantsCount,
    expectedByeRemoval,
    expectedCompassByes,
    expectedByeDrawPositions,

    writeFile,
  });
});

function testByeRemoval({ stage, expectedByeRemoval }) {
  const { structures } = drawEngine.getDrawStructures({ stage });

  const directionEast = findStructureByName(structures, 'EAST');
  const { structureId } = directionEast;
  const byeDrawPositions = assignedByes(directionEast.positionAssignments);

  const { byeMatchUps } = drawEngine.drawMatchUps({
    includeByeMatchUps: true,
  });
  expect(byeMatchUps.length).toEqual(expectedByeRemoval.initialByeMatchUpCount);

  if (expectedByeRemoval.clearExpect) {
    expectedByeRemoval.clearExpect.forEach(([index, length]) => {
      drawEngine.clearDrawPosition({
        structureId,
        drawPosition: byeDrawPositions[index],
      });
      const { byeMatchUps } = drawEngine.drawMatchUps({
        includeByeMatchUps: true,
      });
      expect(byeMatchUps.length).toEqual(length);
    });
  }
}

function checkCompassByes({ stage, expectedCompassByes }) {
  const { structures } = drawEngine.getDrawStructures({ stage });

  Object.keys(expectedCompassByes).forEach((direction) => {
    const structure = findStructureByName(structures, direction);
    const byeDrawPositions = assignedByes(structure.positionAssignments);
    expect(byeDrawPositions).toMatchObject(
      expectedCompassByes[direction].byeDrawPositions
    );
    const byeMatchUpRoundPositions = matchUpsWithBye(structure.matchUps);
    expect(byeMatchUpRoundPositions).toMatchObject(
      expectedCompassByes[direction].roundPositions
    );
  });
}

function checkByeAdvancedDrawPositions({
  stage,
  advanced,
  expectedByeDrawPositions,
}) {
  const { structures } = drawEngine.getDrawStructures({ stage });

  Object.keys(expectedByeDrawPositions).forEach((direction) => {
    const structure = findStructureByName(structures, direction);
    const includeByeMatchUps = expectedByeDrawPositions.includeByeMatchUps;
    const { pendingMatchUps } = drawEngine.getStructureMatchUps({
      structure,
      includeByeMatchUps,
    });
    const filteredMatchUps = pendingMatchUps.filter(pendingWithOneParticipant);

    if (advanced) {
      const expectedFiltered =
        expectedByeDrawPositions[direction].advancedFiltered;
      if (expectedFiltered) {
        expect(filteredMatchUps.length).toEqual(expectedFiltered[0]);
        if (filteredMatchUps.length) {
          expect(filteredMatchUps[0].roundPosition).toEqual(
            expectedFiltered[1]
          );
          expect(filteredMatchUps[1].roundPosition).toEqual(
            expectedFiltered[2]
          );
        }
      }
      const pendingLength =
        expectedByeDrawPositions[direction].pendingAdvancedLength;
      if (pendingLength) expect(pendingMatchUps.length).toEqual(pendingLength);
      if (pendingMatchUps.length) {
        const pendingRoundPosition =
          expectedByeDrawPositions[direction].pendingAdvancedRoundPosition;
        if (pendingRoundPosition)
          expect(pendingMatchUps[0].roundPosition).toEqual(
            pendingRoundPosition
          );
        const pendingDrawPositions =
          expectedByeDrawPositions[direction].pendingAdvancedDrawPositions;
        if (pendingDrawPositions)
          expect(pendingMatchUps[0].drawPositions).toMatchObject(
            pendingDrawPositions
          );
      }
    } else {
      const unadvancedFiltered =
        expectedByeDrawPositions[direction].unadvancedFiltered;
      if (unadvancedFiltered)
        expect(filteredMatchUps.length).toEqual(unadvancedFiltered);
      const unadvancedPending =
        expectedByeDrawPositions[direction].unadvancedPending;
      if (unadvancedPending)
        expect(pendingMatchUps.length).toEqual(unadvancedPending);
      const pendingDrawPositions =
        expectedByeDrawPositions[direction].pendingUnadvancedDrawPositions;
      if (pendingDrawPositions) {
        expect(pendingMatchUps[0].drawPositions).toMatchObject(
          pendingDrawPositions[0]
        );
        expect(pendingMatchUps[1].drawPositions).toMatchObject(
          pendingDrawPositions[1]
        );
        expect(pendingMatchUps[2].drawPositions).toMatchObject(
          pendingDrawPositions[2]
        );
      }
    }
  });

  function pendingWithOneParticipant(matchUp) {
    return (
      matchUp.roundNumber === 2 &&
      matchUp.drawPositions.filter((f) => f).length === 1
    );
  }
}

function generateCompass({
  drawSize,
  writeFile,
  seedsCount,
  participantsCount,
  expectedByeRemoval,
  expectedCompassByes,
  expectedByeDrawPositions,
}) {
  const stage = MAIN;
  const drawType = COMPASS;

  drawEngine.reset();
  drawEngine.newDrawDefinition();
  drawEngine.setStageDrawSize({ stage, drawSize });
  drawEngine.generateDrawType({ drawType });
  const {
    structures: [structure],
  } = drawEngine.getDrawStructures({ stage, stageSequence: 1 });
  const { structureId } = structure;

  drawEngine.attachPolicy({ policyDefinition: SEEDING_POLICY });

  const participants = generateRange(0, participantsCount).map((i) => ({
    participantId: `ko-uuid${i + 1}`,
  }));
  const participantIds = participants.map((p) => p.participantId);

  drawEngine.addDrawEntries({ stage, participantIds });
  drawEngine.initializeStructureSeedAssignments({ structureId, seedsCount });

  generateRange(0, seedsCount).forEach((i) => {
    const seedNumber = i + 1;
    const participantId = participants[i].participantId;
    drawEngine.assignSeed({ structureId, seedNumber, participantId });
  });

  drawEngine.automatedPositioning({ structureId });

  checkCompassByes({ stage, expectedCompassByes });
  checkByeAdvancedDrawPositions({
    stage,
    advanced: true,
    expectedByeDrawPositions,
  });

  const { drawDefinition: snapshot } = drawEngine.getState();

  testByeRemoval({ stage, expectedByeRemoval });
  checkByeAdvancedDrawPositions({
    stage,
    advanced: false,
    expectedByeDrawPositions,
  });

  const fileName = `${drawType}.json`;
  const dirPath = './src/drawEngine/documentation/generated/';
  const output = `${dirPath}${fileName}`;
  if (writeFile)
    fs.writeFileSync(output, JSON.stringify(snapshot, undefined, 2));
}

function assignedByes(assignments) {
  return assignments
    .filter((assignment) => assignment.bye)
    .map((assignment) => assignment.drawPosition);
}
function matchUpsWithBye(matchUps) {
  return matchUps
    .filter((matchUp) => matchUp.matchUpStatus === BYE)
    .map((matchUp) => matchUp.roundPosition);
}
function findStructureByName(structures, structureName) {
  return structures.reduce((structure, currentStructure) => {
    return currentStructure.structureName === structureName
      ? currentStructure
      : structure;
  }, undefined);
}
