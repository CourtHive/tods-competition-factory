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

  // no BYEs have yet been assigned because participants with first round BYEs may lose in second round
  // and progress to consolation structure due to first matchUp loss
  verifyStructure({
    structureId: consolationStructureId,
    expectedSeeds: 0,
    expectedSeedsWithByes: 0,
    expectedByeAssignments: 0,
    expectedPositionsAssignedCount: 0,
    expectedSeedValuesWithBye: [],
  });

  verifyMatchUps({
    structureId: consolationStructureId,
    expectedRoundPending: [0, 4, 2, 1],
    expectedRoundUpcoming: [8, 0],
    expectedRoundCompleted: [0, 0],
    requireParticipants: false,
  });

  verifyMatchUps({
    structureId: consolationStructureId,
    expectedRoundPending: [8, 4, 2, 1],
    expectedRoundUpcoming: [0, 0],
    expectedRoundCompleted: [0, 0],
    requireParticipants: true, // requires that drawPositions be assigned to participantIds
  });
});

it('can direct winners and losers', () => {
  const drawSize = 32;
  const seedsCount = 8;
  const participantsCount = 30;

  let result;

  const { mainStructureId, consolationStructureId } = generateFMLC({
    drawSize,
    seedsCount,
    participantsCount,
  });

  result = completeMatchUp({
    structureId: mainStructureId,
    roundNumber: 1,
    roundPosition: 2,
    winningSide: 2,
  });
  expect(result.success).toEqual(true);

  result = completeMatchUp({
    structureId: mainStructureId,
    roundNumber: 1,
    roundPosition: 3,
    winningSide: 1,
  });
  expect(result.success).toEqual(true);

  result = completeMatchUp({
    structureId: mainStructureId,
    roundNumber: 1,
    roundPosition: 4,
    winningSide: 1,
  });
  expect(result.success).toEqual(true);

  verifyMatchUps({
    structureId: mainStructureId,
    expectedRoundPending: [0, 6],
    expectedRoundUpcoming: [11, 2],
    expectedRoundCompleted: [3, 0],
  });

  verifyMatchUps({
    structureId: consolationStructureId,
    expectedRoundPending: [7, 4, 2, 1],
    expectedRoundUpcoming: [1, 0],
    expectedRoundCompleted: [0, 0],
    requireParticipants: true, // requires that drawPositions be assigned to participantIds
  });

  // now the participant in drawPosition: 1 will lose to the winner of 3-4 and be fed into consolation
  // this tests first matchUp loss in the second round for participant who received a first round BYE
  // the participant in drawPosition: 1 should go into the consolation structure
  result = completeMatchUp({
    structureId: mainStructureId,
    roundNumber: 2,
    roundPosition: 1,
    winningSide: 2,
  });

  let {
    structures: [mainStructure],
  } = drawEngine.getDrawStructures({ stage: MAIN, stageSequence: 1 });
  const { structureId: verifyMainStructureId } = mainStructure;

  let {
    structures: [consolationStructure],
  } = drawEngine.getDrawStructures({ stage: CONSOLATION, stageSequence: 1 });
  const { structureId: verifyConsolationStructureId } = consolationStructure;

  expect(mainStructureId).toEqual(verifyMainStructureId);
  expect(consolationStructureId).toEqual(verifyConsolationStructureId);

  // find second round matchUp for first seeded player with BYE
  let sourceMatchUp = mainStructure.matchUps.find(
    matchUp => matchUp.roundNumber === 2 && matchUp.roundPosition === 1
  );

  let sourceDrawPositionParticipantId = mainStructure.positionAssignments.find(
    assignment => assignment.drawPosition === 1
  )?.participantId;
  expect(sourceMatchUp.drawPositions.includes(1)).toEqual(true);

  let targetDrawPositionParticipantId = consolationStructure.positionAssignments.find(
    assignment => assignment.drawPosition === 1
  )?.participantId;

  let targetMatchUp = consolationStructure.matchUps.find(
    matchUp => matchUp.roundNumber === 1 && matchUp.roundPosition === 1
  );
  expect(targetMatchUp.drawPositions.includes(1)).toEqual(true);
  expect(targetMatchUp.matchUpStatus).toEqual(TO_BE_PLAYED);

  expect(sourceDrawPositionParticipantId).toEqual(
    targetDrawPositionParticipantId
  );
  expect(consolationStructure.positionAssignments[0].bye).toEqual(undefined);

  result = completeMatchUp({
    structureId: mainStructureId,
    roundNumber: 1,
    roundPosition: 13,
    winningSide: 2,
  });
  result = completeMatchUp({
    structureId: mainStructureId,
    roundNumber: 1,
    roundPosition: 14,
    winningSide: 1,
  });
  result = completeMatchUp({
    structureId: mainStructureId,
    roundNumber: 1,
    roundPosition: 15,
    winningSide: 1,
  });

  verifyMatchUps({
    structureId: mainStructureId,
    expectedRoundPending: [0, 4],
    expectedRoundUpcoming: [8, 3],
    expectedRoundCompleted: [6, 1],
  });

  verifyMatchUps({
    structureId: consolationStructureId,
    expectedRoundPending: [5, 4, 2, 1],
    expectedRoundUpcoming: [3, 0],
    expectedRoundCompleted: [0, 0],
  });

  // now advance drawPosition 32 in main structure which had a BYE in first round
  // the loser from drawPositions 29-30 should NOT go into the consolation structure
  completeMatchUp({
    structureId: mainStructureId,
    roundNumber: 2,
    roundPosition: 8,
    winningSide: 2,
  });

  ({
    structures: [mainStructure],
  } = drawEngine.getDrawStructures({ stage: MAIN, stageSequence: 1 }));

  ({
    structures: [consolationStructure],
  } = drawEngine.getDrawStructures({ stage: CONSOLATION, stageSequence: 1 }));

  sourceMatchUp = mainStructure.matchUps.find(
    matchUp => matchUp.roundNumber === 2 && matchUp.roundPosition === 8
  );

  sourceDrawPositionParticipantId = mainStructure.positionAssignments.find(
    assignment => assignment.drawPosition === 32
  )?.participantId;
  expect(sourceMatchUp.drawPositions.includes(32)).toEqual(true);

  targetMatchUp = consolationStructure.matchUps.find(
    matchUp => matchUp.roundNumber === 1 && matchUp.roundPosition === 8
  );

  targetDrawPositionParticipantId = consolationStructure.positionAssignments.find(
    assignment => assignment.drawPosition === 16
  )?.participantId;

  expect(targetMatchUp.drawPositions.includes(16)).toEqual(true);
  expect(targetMatchUp.matchUpStatus).toEqual(BYE);

  expect(sourceDrawPositionParticipantId).not.toEqual(
    targetDrawPositionParticipantId
  );
  expect(consolationStructure.positionAssignments[15].bye).toEqual(true);
});

it('can change matchUpStatus', () => {
  const { completedMatchUps } = drawEngine.drawMatchUps({
    requireParticipants: false,
  });
  const completedMatchUpsCount = completedMatchUps.length;
  expect(completedMatchUpsCount).toEqual(8);

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
