import { drawEngine } from '../../sync';
import { verifyStructure } from '../../tests/primitives/verifyStructure';
import {
  completeMatchUp,
  verifyMatchUps,
} from '../../tests/primitives/verifyMatchUps';

import { generateFMLC } from '../primitives/firstMatchLoserConsolation';

import {
  BYE,
  RETIRED,
  TO_BE_PLAYED,
} from '../../../constants/matchUpStatusConstants';
import { MAIN, CONSOLATION } from '../../../constants/drawDefinitionConstants';

it('can generate FIRST_MATCH_LOSER_CONSOLATION', () => {
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
    expectedByeAssignments: 2,
    expectedPositionsAssignedCount: 2,
    expectedSeedValuesWithBye: [],
  });

  verifyMatchUps({
    structureId: consolationStructureId,
    expectedRoundPending: [0, 6, 4, 2, 1],
    expectedRoundUpcoming: [6, 2],
    expectedRoundCompleted: [0, 0],
    requireParticipants: false,
  });

  verifyMatchUps({
    structureId: consolationStructureId,
    expectedRoundPending: [6, 8, 4, 2, 1],
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
    expectedRoundPending: [5, 7, 4, 2, 1],
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
    (matchUp) => matchUp.roundNumber === 2 && matchUp.roundPosition === 1
  );

  let sourceDrawPositionParticipantId = mainStructure.positionAssignments.find(
    (assignment) => assignment.drawPosition === 1
  )?.participantId;
  expect(sourceMatchUp.drawPositions.includes(1)).toEqual(true);

  let targetDrawPositionParticipantId = consolationStructure.positionAssignments.find(
    (assignment) => assignment.drawPosition === 1
  )?.participantId;

  let targetMatchUp = consolationStructure.matchUps.find(
    (matchUp) => matchUp.roundNumber === 1 && matchUp.roundPosition === 1
  );
  expect(targetMatchUp.drawPositions).toEqual([9, 10]);
  expect(targetMatchUp.matchUpStatus).toEqual(BYE);

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
    expectedRoundPending: [4, 5, 4, 2, 1],
    expectedRoundUpcoming: [2, 1],
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
    (matchUp) => matchUp.roundNumber === 2 && matchUp.roundPosition === 8
  );

  sourceDrawPositionParticipantId = mainStructure.positionAssignments.find(
    (assignment) => assignment.drawPosition === 32
  )?.participantId;
  expect(sourceMatchUp.drawPositions.includes(32)).toEqual(true);

  targetMatchUp = consolationStructure.matchUps.find(
    (matchUp) => matchUp.roundNumber === 1 && matchUp.roundPosition === 8
  );

  targetDrawPositionParticipantId = consolationStructure.positionAssignments.find(
    (assignment) => assignment.drawPosition === 16
  )?.participantId;

  expect(targetMatchUp.drawPositions).toEqual([23, 24]);
  expect(targetMatchUp.matchUpStatus).toEqual(BYE);

  expect(sourceDrawPositionParticipantId).not.toEqual(
    targetDrawPositionParticipantId
  );
  // fed position should be a bye
  expect(consolationStructure.positionAssignments[8].bye).toEqual(true);
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
  let hasErrors = Boolean(result?.error?.errors?.length);
  expect(hasErrors).toEqual(true);

  result = drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpStatus: BYE,
  });
  hasErrors = Boolean(result?.error?.errors?.length);
  expect(hasErrors).toEqual(true);

  result = drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpStatus: RETIRED,
  });
  hasErrors = Boolean(result?.error?.errors?.length);
  expect(hasErrors).toEqual(false);

  const { matchUp: fetchedMatchUp } = drawEngine.findMatchUp({ matchUpId });
  const { matchUpStatus } = fetchedMatchUp;
  expect(matchUpStatus).toEqual(RETIRED);
});

it('can direct winners and losers drawSize: 4 with NO BYEs', () => {
  const drawSize = 4;
  const seedsCount = 0;
  const participantsCount = 4;

  let result;

  const { mainStructureId, consolationStructureId } = generateFMLC({
    drawSize,
    seedsCount,
    participantsCount,
  });

  result = completeMatchUp({
    structureId: mainStructureId,
    roundNumber: 1,
    roundPosition: 1,
    winningSide: 1,
  });
  expect(result.success).toEqual(true);

  result = completeMatchUp({
    structureId: mainStructureId,
    roundNumber: 1,
    roundPosition: 2,
    winningSide: 1,
  });
  expect(result.success).toEqual(true);

  verifyMatchUps({
    structureId: mainStructureId,
    expectedRoundPending: [0, 0],
    expectedRoundUpcoming: [0, 1],
    expectedRoundCompleted: [2, 0],
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
    (matchUp) => matchUp.roundNumber === 2 && matchUp.roundPosition === 1
  );

  let sourceDrawPositionParticipantId = mainStructure.positionAssignments.find(
    (assignment) => assignment.drawPosition === 1
  )?.participantId;
  expect(sourceMatchUp.drawPositions.includes(1)).toEqual(true);

  let targetDrawPositionParticipantId = consolationStructure.positionAssignments.find(
    (assignment) => assignment.drawPosition === 2
  )?.participantId;

  let targetMatchUp = consolationStructure.matchUps.find(
    (matchUp) => matchUp.roundNumber === 1 && matchUp.roundPosition === 1
  );
  expect(targetMatchUp.drawPositions).toEqual([2, 3]);
  expect(targetMatchUp.matchUpStatus).toEqual(TO_BE_PLAYED);

  expect(sourceDrawPositionParticipantId).not.toEqual(
    targetDrawPositionParticipantId
  );
  expect(consolationStructure.positionAssignments[0].bye).toEqual(true);
});
