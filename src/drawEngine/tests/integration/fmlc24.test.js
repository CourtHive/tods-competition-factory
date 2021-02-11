import { drawEngine } from '../../sync';
import { instanceCount } from '../../../utilities';
import {
  completeMatchUp,
  verifyMatchUps,
} from '../../tests/primitives/verifyMatchUps';
import { generateFMLC } from '../../tests/primitives/fmlc';

import { BYE } from '../../../constants/matchUpStatusConstants';
import { MAIN, CONSOLATION } from '../../../constants/drawDefinitionConstants';
import USTA_SEEDING from '../../../fixtures/policies/POLICY_SEEDING_USTA';
import ITF_SEEDING from '../../../fixtures/policies/POLICY_SEEDING_ITF';

it('can direct winners and losers with ITF SEEDING POLICY; all participants with BYEs win first matchUp', () => {
  const drawSize = 32;
  const seedsCount = 8;
  const participantsCount = 24;

  const { mainStructureId, consolationStructureId } = generateFMLC({
    drawSize,
    seedsCount,
    participantsCount,
    policyDefinition: ITF_SEEDING,
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

  let { roundMatchUps } = drawEngine.getRoundMatchUps(consolationStructure);
  const matchUpStatuses = instanceCount(
    roundMatchUps[1].map(({ matchUpStatus }) => matchUpStatus)
  );
  // all first round consolation matchUps are BYEs
  expect(matchUpStatuses.BYE).toEqual(8);

  verifyMatchUps({
    structureId: mainStructureId,
    expectedRoundPending: [0, 8],
    expectedRoundUpcoming: [8, 0],
    expectedRoundCompleted: [0, 0],
  });

  let completionValues = [
    [1, 1, 2, undefined], // can't complete BYE
    [1, 2, 2, true],
    [1, 3, 1, true],
    [1, 4, 1, undefined], // can't complete BYE
    [1, 5, 2, undefined], // can't complete BYE
    [1, 6, 1, true],
    [1, 7, 1, true],
    [1, 8, 2, undefined], // can't complete BYE
    [1, 9, 1, undefined], // can't complete BYE
    [1, 10, 1, true],
    [1, 11, 1, true],
    [1, 12, 2, undefined], // can't complete BYE
    [1, 13, 1, undefined], // can't complete BYE
    [1, 14, 1, true],
    [1, 15, 1, true],
    [1, 16, 2, undefined], // can't complete BYE
  ];

  completionValues.forEach((values) => {
    const [roundNumber, roundPosition, winningSide, success] = values;
    const result = completeMatchUp({
      structureId: mainStructureId,
      roundNumber,
      roundPosition,
      winningSide,
    });
    expect(result.success).toEqual(success);
  });

  verifyMatchUps({
    structureId: mainStructureId,
    expectedRoundPending: [0, 0, 4, 2, 1],
    expectedRoundUpcoming: [0, 8],
    expectedRoundCompleted: [8, 0],
  });

  verifyMatchUps({
    structureId: consolationStructureId,
    expectedRoundPending: [0, 8, 4, 2, 1],
    expectedRoundUpcoming: [0, 0],
    expectedRoundCompleted: [0, 0],
    requireParticipants: true, // requires that drawPositions be assigned to participantIds
  });

  completionValues = [
    [2, 1, 1, true], // side 1 had 1st round BYE, wins matchUp
    [2, 2, 2, true], // side 2 had 1st round BYE, wins matchUp
    [2, 3, 1, true], // side 1 had 1st round BYE, wins matchUp
    [2, 4, 2, true], // side 2 had 1st round BYE, wins matchUp
    [2, 5, 1, true], // side 1 had 1st round BYE, wins matchUp
    [2, 6, 2, true], // side 2 had 1st round BYE, wins matchUp
    [2, 7, 1, true], // side 1 had 1st round BYE, wins matchUp
    [2, 8, 2, true], // side 2 had 1st round BYE, wins matchUp
  ];

  completionValues.forEach((values) => {
    const [roundNumber, roundPosition, winningSide, success] = values;
    const result = completeMatchUp({
      structureId: mainStructureId,
      roundNumber,
      roundPosition,
      winningSide,
    });
    expect(result.success).toEqual(success);
    if (result.success) expect(result.matchUp.winningSide).toEqual(winningSide);
  });

  const positionAssignmentByesCount = consolationStructure.positionAssignments.filter(
    (assignment) => !!assignment.bye
  ).length;
  const positionAssignmentParticipantidsCount = consolationStructure.positionAssignments.filter(
    (assignment) => !!assignment.participantId
  ).length;

  expect(positionAssignmentByesCount).toEqual(16);
  expect(positionAssignmentParticipantidsCount).toEqual(8);

  ({ roundMatchUps } = drawEngine.getRoundMatchUps(consolationStructure));
  roundMatchUps[1].forEach((matchUp) => {
    expect(matchUp.matchUpStatus).toEqual(BYE);
  });
});

it('can direct winners and losers with ITF SEEDING POLICY; all participants with BYEs lose first matchUp', () => {
  const drawSize = 32;
  const seedsCount = 8;
  const participantsCount = 24;

  const { mainStructureId, consolationStructureId } = generateFMLC({
    drawSize,
    seedsCount,
    participantsCount,
    policyDefinition: ITF_SEEDING,
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

  let { roundMatchUps } = drawEngine.getRoundMatchUps(consolationStructure);
  const matchUpStatuses = instanceCount(
    roundMatchUps[1].map(({ matchUpStatus }) => matchUpStatus)
  );
  // all first round consolation matchUps are BYEs
  expect(matchUpStatuses.BYE).toEqual(8);

  verifyMatchUps({
    structureId: mainStructureId,
    expectedRoundPending: [0, 8],
    expectedRoundUpcoming: [8, 0],
    expectedRoundCompleted: [0, 0],
  });

  let completionValues = [
    [1, 1, 2, undefined], // can't complete BYE
    [1, 2, 2, true],
    [1, 3, 1, true],
    [1, 4, 1, undefined], // can't complete BYE
    [1, 5, 2, undefined], // can't complete BYE
    [1, 6, 1, true],
    [1, 7, 1, true],
    [1, 8, 2, undefined], // can't complete BYE
    [1, 9, 1, undefined], // can't complete BYE
    [1, 10, 1, true],
    [1, 11, 1, true],
    [1, 12, 2, undefined], // can't complete BYE
    [1, 13, 1, undefined], // can't complete BYE
    [1, 14, 1, true],
    [1, 15, 1, true],
    [1, 16, 2, undefined], // can't complete BYE
  ];

  completionValues.forEach((values) => {
    const [roundNumber, roundPosition, winningSide, success] = values;
    const result = completeMatchUp({
      structureId: mainStructureId,
      roundNumber,
      roundPosition,
      winningSide,
    });
    expect(result.success).toEqual(success);
  });

  verifyMatchUps({
    structureId: mainStructureId,
    expectedRoundPending: [0, 0, 4, 2, 1],
    expectedRoundUpcoming: [0, 8],
    expectedRoundCompleted: [8, 0],
  });

  verifyMatchUps({
    structureId: consolationStructureId,
    expectedRoundPending: [0, 8, 4, 2, 1],
    expectedRoundUpcoming: [0, 0],
    expectedRoundCompleted: [0, 0],
    requireParticipants: true, // requires that drawPositions be assigned to participantIds
  });

  completionValues = [
    [2, 1, 2, true], // side 1 had 1st round BYE, loses matchUp
    [2, 2, 1, true], // side 2 had 1st round BYE, loses matchUp
    [2, 3, 2, true], // side 1 had 1st round BYE, loses matchUp
    [2, 4, 1, true], // side 2 had 1st round BYE, loses matchUp
    [2, 5, 2, true], // side 1 had 1st round BYE, loses matchUp
    [2, 6, 1, true], // side 2 had 1st round BYE, loses matchUp
    [2, 7, 2, true], // side 1 had 1st round BYE, loses matchUp
    [2, 8, 1, true], // side 2 had 1st round BYE, loses matchUp
  ];

  completionValues.forEach((values) => {
    const [roundNumber, roundPosition, winningSide, success] = values;
    const result = completeMatchUp({
      structureId: mainStructureId,
      roundNumber,
      roundPosition,
      winningSide,
    });
    expect(result.success).toEqual(success);
    if (result.success) expect(result.matchUp.winningSide).toEqual(winningSide);
  });

  const positionAssignmentByesCount = consolationStructure.positionAssignments.filter(
    (assignment) => !!assignment.bye
  ).length;
  const positionAssignmentParticipantidsCount = consolationStructure.positionAssignments.filter(
    (assignment) => !!assignment.participantId
  ).length;
  expect(positionAssignmentByesCount).toEqual(8);
  expect(positionAssignmentParticipantidsCount).toEqual(16);

  ({ roundMatchUps } = drawEngine.getRoundMatchUps(consolationStructure));
  roundMatchUps[1].forEach((matchUp) => {
    expect(matchUp.matchUpStatus).toEqual(BYE);
  });
});

it('can direct winners and losers with USTA SEEDING POLICY; all participants with BYEs win first matchUp', () => {
  const drawSize = 32;
  const seedsCount = 8;
  const participantsCount = 24;

  const { mainStructureId, consolationStructureId } = generateFMLC({
    drawSize,
    seedsCount,
    participantsCount,
    policyDefinition: USTA_SEEDING,
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

  let { roundMatchUps } = drawEngine.getRoundMatchUps(consolationStructure);
  roundMatchUps[1].forEach((matchUp) => {
    expect(matchUp.matchUpStatus).toEqual(BYE);
  });

  verifyMatchUps({
    structureId: mainStructureId,
    expectedRoundPending: [0, 8],
    expectedRoundUpcoming: [8, 0],
    expectedRoundCompleted: [0, 0],
  });

  let completionValues = [
    [1, 1, 2, undefined], // can't complete BYE
    [1, 2, 2, true],
    [1, 3, 1, undefined], // can't complete BYE
    [1, 4, 1, true],
    [1, 5, 2, undefined], // can't complete BYE
    [1, 6, 1, true],
    [1, 7, 1, undefined], // can't complete BYE
    [1, 8, 2, true],
    [1, 9, 1, true],
    [1, 10, 1, undefined], // can't complete BYE
    [1, 11, 1, true],
    [1, 12, 2, undefined], // can't complete BYE
    [1, 13, 1, true],
    [1, 14, 1, undefined], // can't complete BYE
    [1, 15, 1, true],
    [1, 16, 2, undefined], // can't complete BYE
  ];

  completionValues.forEach((values) => {
    const [roundNumber, roundPosition, winningSide, success] = values;
    const result = completeMatchUp({
      structureId: mainStructureId,
      roundNumber,
      roundPosition,
      winningSide,
    });
    expect(result.success).toEqual(success);
  });

  verifyMatchUps({
    structureId: mainStructureId,
    expectedRoundPending: [0, 0, 4, 2, 1],
    expectedRoundUpcoming: [0, 8],
    expectedRoundCompleted: [8, 0],
  });

  verifyMatchUps({
    structureId: consolationStructureId,
    expectedRoundPending: [0, 8, 4, 2, 1],
    expectedRoundUpcoming: [0, 0],
    expectedRoundCompleted: [0, 0],
    requireParticipants: true, // requires that drawPositions be assigned to participantIds
  });

  completionValues = [
    [2, 1, 1, true], // side 1 had 1st round BYE, wins matchUp
    [2, 2, 1, true], // side 1 had 1st round BYE, wins matchUp
    [2, 3, 1, true], // side 1 had 1st round BYE, wins matchUp
    [2, 4, 1, true], // side 1 had 1st round BYE, wins matchUp
    [2, 5, 2, true], // side 2 had 1st round BYE, wins matchUp
    [2, 6, 2, true], // side 2 had 1st round BYE, wins matchUp
    [2, 7, 2, true], // side 2 had 1st round BYE, wins matchUp
    [2, 8, 2, true], // side 2 had 1st round BYE, wins matchUp
  ];

  completionValues.forEach((values) => {
    const [roundNumber, roundPosition, winningSide, success] = values;
    const result = completeMatchUp({
      structureId: mainStructureId,
      roundNumber,
      roundPosition,
      winningSide,
    });
    expect(result.success).toEqual(success);
  });

  const positionAssignmentByesCount = consolationStructure.positionAssignments.filter(
    (assignment) => !!assignment.bye
  ).length;
  const positionAssignmentParticipantidsCount = consolationStructure.positionAssignments.filter(
    (assignment) => !!assignment.participantId
  ).length;
  expect(positionAssignmentByesCount).toEqual(16);
  expect(positionAssignmentParticipantidsCount).toEqual(8);

  // wne participants who advanced in the first-round of the main structure with a BYE win their second-round main structure matchUps,
  // matchUps in the first round of the consolation structure should have matchUpStatus: BYE
  ({ roundMatchUps } = drawEngine.getRoundMatchUps(consolationStructure));
  roundMatchUps[1].forEach((matchUp) => {
    expect(matchUp.matchUpStatus).toEqual(BYE);
  });
});

it('can direct winners and losers with USTA SEEDING POLICY; all participants with BYEs lose first matchUp', () => {
  const drawSize = 32;
  const seedsCount = 8;
  const participantsCount = 24;

  const { mainStructureId, consolationStructureId } = generateFMLC({
    drawSize,
    seedsCount,
    participantsCount,
    policyDefinition: USTA_SEEDING,
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

  let { roundMatchUps } = drawEngine.getRoundMatchUps(consolationStructure);
  roundMatchUps[1].forEach((matchUp) => {
    expect(matchUp.matchUpStatus).toEqual(BYE);
  });

  verifyMatchUps({
    structureId: mainStructureId,
    expectedRoundPending: [0, 8],
    expectedRoundUpcoming: [8, 0],
    expectedRoundCompleted: [0, 0],
  });

  let completionValues = [
    [1, 1, 2, undefined], // can't complete BYE
    [1, 2, 2, true],
    [1, 3, 1, undefined], // can't complete BYE
    [1, 4, 1, true],
    [1, 5, 2, undefined], // can't complete BYE
    [1, 6, 1, true],
    [1, 7, 1, undefined], // can't complete BYE
    [1, 8, 2, true],
    [1, 9, 1, true],
    [1, 10, 1, undefined], // can't complete BYE
    [1, 11, 1, true],
    [1, 12, 2, undefined], // can't complete BYE
    [1, 13, 1, true],
    [1, 14, 1, undefined], // can't complete BYE
    [1, 15, 1, true],
    [1, 16, 2, undefined], // can't complete BYE
  ];

  completionValues.forEach((values) => {
    const [roundNumber, roundPosition, winningSide, success] = values;
    const result = completeMatchUp({
      structureId: mainStructureId,
      roundNumber,
      roundPosition,
      winningSide,
    });
    expect(result.success).toEqual(success);
  });

  verifyMatchUps({
    structureId: mainStructureId,
    expectedRoundPending: [0, 0, 4, 2, 1],
    expectedRoundUpcoming: [0, 8],
    expectedRoundCompleted: [8, 0],
  });

  verifyMatchUps({
    structureId: consolationStructureId,
    expectedRoundPending: [0, 8, 4, 2, 1],
    expectedRoundUpcoming: [0, 0],
    expectedRoundCompleted: [0, 0],
    requireParticipants: true, // requires that drawPositions be assigned to participantIds
  });

  completionValues = [
    [2, 1, 2, true], // side 1 had 1st round BYE, loses matchUp
    [2, 2, 2, true], // side 1 had 1st round BYE, loses matchUp
    [2, 3, 2, true], // side 1 had 1st round BYE, loses matchUp
    [2, 4, 2, true], // side 1 had 1st round BYE, loses matchUp
    [2, 5, 1, true], // side 2 had 1st round BYE, loses matchUp
    [2, 6, 1, true], // side 2 had 1st round BYE, loses matchUp
    [2, 7, 1, true], // side 2 had 1st round BYE, loses matchUp
    [2, 8, 1, true], // side 2 had 1st round BYE, loses matchUp
  ];

  completionValues.forEach((values) => {
    const [roundNumber, roundPosition, winningSide, success] = values;
    const result = completeMatchUp({
      structureId: mainStructureId,
      roundNumber,
      roundPosition,
      winningSide,
    });
    expect(result.success).toEqual(success);
  });

  const positionAssignmentByesCount = consolationStructure.positionAssignments.filter(
    (assignment) => !!assignment.bye
  ).length;
  const positionAssignmentParticipantidsCount = consolationStructure.positionAssignments.filter(
    (assignment) => !!assignment.participantId
  ).length;
  expect(positionAssignmentByesCount).toEqual(8);
  expect(positionAssignmentParticipantidsCount).toEqual(16);

  ({ roundMatchUps } = drawEngine.getRoundMatchUps(consolationStructure));
  roundMatchUps[1].forEach((matchUp) => {
    expect(matchUp.matchUpStatus).toEqual(BYE);
  });
});
