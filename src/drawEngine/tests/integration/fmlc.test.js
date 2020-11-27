import fs from 'fs';

import { drawEngine } from '../../../drawEngine';
import { verifyStructure } from '../../tests/primitives/verifyStructure';
import {
  completeMatchUp,
  verifyMatchUps,
} from '../../tests/primitives/verifyMatchUps';

import { generateFMLC } from '../../tests/primitives/fmlc';

import {
  BYE,
  RETIRED,
  TO_BE_PLAYED,
} from '../../../constants/matchUpStatusConstants';
import {
  MAIN,
  FMLC,
  CONSOLATION,
} from '../../../constants/drawDefinitionConstants';

it('can generate FMLC', () => {
  const drawSize = 32;
  const seedsCount = 8;
  const participantsCount = 30;

  const { mainStructureId, consolationStructureId } = generateFMLC({
    drawSize,
    seedsCount,
    participantsCount,
  });

  verifyStructure({
    structureId: mainStructureId,
    expectedSeeds: 8,
    expectedSeedsWithByes: 2,
    expectedByeAssignments: 2,
    expectedPositionsAssignedCount: 32,
    expectedSeedValuesWithBye: [1, 2],
  });

  verifyMatchUps({
    structureId: mainStructureId,
    expectedRoundPending: [0, 8],
    expectedRoundUpcoming: [14, 0],
    expectedRoundCompleted: [0, 0],
  });

  verifyStructure({
    structureId: consolationStructureId,
    expectedSeeds: 0,
    expectedSeedsWithByes: 0,
    expectedByeAssignments: 2,
    expectedPositionsAssignedCount: 2,
    expectedSeedValuesWithBye: [],
  });

  verifyMatchUps({
    structureId: consolationStructureId,
    expectedRoundPending: [0, 4, 2, 1],
    expectedRoundUpcoming: [6, 0],
    expectedRoundCompleted: [0, 0],
    requireParticipants: false,
  });

  verifyMatchUps({
    structureId: consolationStructureId,
    expectedRoundPending: [6, 4, 2, 1],
    expectedRoundUpcoming: [0, 0],
    expectedRoundCompleted: [0, 0],
    requireParticipants: true, // requires that drawPositions be assigned to participantIds
  });
});

it('can direct winners and losers', () => {
  const drawSize = 32;
  const seedsCount = 8;
  const participantsCount = 30;

  const { mainStructureId, consolationStructureId } = generateFMLC({
    drawSize,
    seedsCount,
    participantsCount,
  });

  completeMatchUp({
    structureId: mainStructureId,
    roundNumber: 1,
    roundPosition: 2,
    winningSide: 2,
  });
  completeMatchUp({
    structureId: mainStructureId,
    roundNumber: 1,
    roundPosition: 3,
    winningSide: 1,
  });
  completeMatchUp({
    structureId: mainStructureId,
    roundNumber: 1,
    roundPosition: 4,
    winningSide: 1,
  });

  verifyMatchUps({
    structureId: mainStructureId,
    expectedRoundPending: [0, 6],
    expectedRoundUpcoming: [11, 2],
    expectedRoundCompleted: [3, 0],
  });

  verifyMatchUps({
    structureId: consolationStructureId,
    expectedRoundPending: [5, 4, 2, 1],
    expectedRoundUpcoming: [1, 0],
    expectedRoundCompleted: [0, 0],
    requireParticipants: true, // requires that drawPositions be assigned to participantIds
  });

  completeMatchUp({
    structureId: mainStructureId,
    roundNumber: 2,
    roundPosition: 1,
    winningSide: 2,
  });

  const {
    structures: [mainStructure],
  } = drawEngine.getDrawStructures({ stage: MAIN, stageSequence: 1 });
  const { structureId: verifyMainStructureId } = mainStructure;

  const {
    structures: [consolationStructure],
  } = drawEngine.getDrawStructures({ stage: CONSOLATION, stageSequence: 1 });
  const { structureId: verifyConsolationStructureId } = consolationStructure;

  expect(mainStructureId).toEqual(verifyMainStructureId);
  expect(consolationStructureId).toEqual(verifyConsolationStructureId);

  // find second round matchUp for first seeded player with BYE
  const sourceMatchUp = mainStructure.matchUps.find(
    matchUp => matchUp.roundNumber === 2 && matchUp.roundPosition === 1
  );

  const sourceDrawPositionParticipantId = mainStructure.positionAssignments.find(
    assignment => assignment.drawPosition === 1
  )?.participantId;
  expect(sourceMatchUp.drawPositions.includes(1)).toEqual(true);

  const targetDrawPositionParticipantId = consolationStructure.positionAssignments.find(
    assignment => assignment.drawPosition === 1
  )?.participantId;

  const targetMatchUp = consolationStructure.matchUps.find(
    matchUp => matchUp.roundNumber === 1 && matchUp.roundPosition === 1
  );
  expect(targetMatchUp.drawPositions.includes(1)).toEqual(true);
  expect(targetMatchUp.matchUpStatus).toEqual(TO_BE_PLAYED);

  expect(sourceDrawPositionParticipantId).toEqual(
    targetDrawPositionParticipantId
  );
});

it('can change matchUpStatus', () => {
  const { completedMatchUps } = drawEngine.drawMatchUps({
    requireParticipants: false,
  });
  const completedMatchUpsCount = completedMatchUps.length;
  expect(completedMatchUpsCount).toEqual(4);

  const [matchUp] = completedMatchUps;
  const { matchUpId } = matchUp;
  let result = drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpStatus: 'BOGUS',
  });
  let hasErrors = Boolean(result?.errors?.length);
  expect(hasErrors).toEqual(true);

  result = drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpStatus: BYE,
  });
  hasErrors = Boolean(result.errors.length);
  expect(hasErrors).toEqual(true);

  result = drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpStatus: RETIRED,
  });
  hasErrors = Boolean(result?.errors?.length);
  expect(hasErrors).toEqual(false);

  const { matchUp: fetchedMatchUp } = drawEngine.findMatchUp({ matchUpId });
  const { matchUpStatus } = fetchedMatchUp;
  expect(matchUpStatus).toEqual(RETIRED);
});

it('can write to the file system', () => {
  const writeFile = process.env.TMX_TEST_FILES;

  const drawType = FMLC;
  const { drawDefinition } = drawEngine.getState();
  const fileName = `${drawType}.json`;
  const dirPath = './src/drawEngine/documentation/generated/';
  const output = `${dirPath}${fileName}`;
  if (writeFile)
    fs.writeFileSync(output, JSON.stringify(drawDefinition, null, 2));
});
