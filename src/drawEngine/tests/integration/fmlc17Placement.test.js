import { drawEngine } from '../..';
import { completeMatchUp } from '../primitives/verifyMatchUps';
import { generateFMLC } from '../primitives/fmlc';

import { CONSOLATION, MAIN } from '../../../constants/drawDefinitionConstants';
import USTA_SEEDING from '../../../fixtures/seeding/SEEDING_USTA';
import ITF_SEEDING from '../../../fixtures/seeding/SEEDING_ITF';
import { chunkArray } from '../../../utilities';

it('can support ITF Consolation BYE placement', () => {
  const drawSize = 32;
  const seedsCount = 8;
  const participantsCount = 17;

  const { mainStructureId } = generateFMLC({
    drawSize,
    seedsCount,
    participantsCount,
    policyDefinition: ITF_SEEDING,
  });

  const {
    structures: [mainStructure],
  } = drawEngine.getDrawStructures({ stage: MAIN, stageSequence: 1 });
  const roundPositionReadyToScore =
    Math.max(
      ...chunkArray(mainStructure.positionAssignments, 2)
        .find(pair =>
          pair.reduce(
            (ready, assignment) => assignment.participantId && ready,
            true
          )
        )
        .map(pair => pair.drawPosition)
    ) / 2;

  const testingSideIndex = roundPositionReadyToScore < 8 ? 0 : 1;
  const secondRoundPositionsReadyToScore = testingSideIndex ? [1, 2] : [7, 8];
  const secondRoundDrawPositions = mainStructure.matchUps
    .filter(
      matchUp =>
        matchUp.roundNumber === 2 &&
        secondRoundPositionsReadyToScore.includes(matchUp.roundPosition)
    )
    .map(matchUp => matchUp.drawPositions)
    .flat();
  const participantIds = mainStructure.positionAssignments
    .filter(assignment =>
      secondRoundDrawPositions.includes(assignment.drawPosition)
    )
    .map(assignment => assignment.participantId);

  // these will be the losing participantIds if side 1 wins first selected matchUp and side 2 wins second selected matchUp
  const losingParticipantIds = participantIds.slice(1, 3);

  const completionValues = [
    [1, roundPositionReadyToScore, 2, true],
    [2, secondRoundPositionsReadyToScore[0], 1, true], // side 1 had 1st round BYE, wins matchUp
    [2, secondRoundPositionsReadyToScore[1], 2, true], // side 2 had 1st round BYE, wins matchUp
  ];

  completionValues.forEach(values => {
    const [roundNumber, roundPosition, winningSide, success] = values;
    const result = completeMatchUp({
      structureId: mainStructureId,
      roundNumber,
      roundPosition,
      winningSide,
    });
    expect(result.success).toEqual(success);
  });

  const {
    structures: [consolationStructure],
  } = drawEngine.getDrawStructures({ stage: CONSOLATION, stageSequence: 1 });

  const positionAssignmentByesCount = consolationStructure.positionAssignments.filter(
    assignment => !!assignment.bye
  ).length;
  const assignedParticipantIds = consolationStructure.positionAssignments
    .filter(assignment => !!assignment.participantId)
    .map(assignment => assignment.participantId);
  losingParticipantIds.forEach(participantId => {
    expect(assignedParticipantIds.includes(participantId)).toEqual(true);
  });
  expect(positionAssignmentByesCount).toEqual(2);
  expect(assignedParticipantIds.length).toEqual(3);
});

it('can support USTA Consolation BYE placement', () => {
  const drawSize = 32;
  const seedsCount = 8;
  const participantsCount = 17;

  const { mainStructureId } = generateFMLC({
    drawSize,
    seedsCount,
    participantsCount,
    policyDefinition: USTA_SEEDING,
  });

  const {
    structures: [mainStructure],
  } = drawEngine.getDrawStructures({ stage: MAIN, stageSequence: 1 });
  const roundPositionReadyToScore =
    Math.max(
      ...chunkArray(mainStructure.positionAssignments, 2)
        .find(pair =>
          pair.reduce(
            (ready, assignment) => assignment.participantId && ready,
            true
          )
        )
        .map(pair => pair.drawPosition)
    ) / 2;

  const testingSideIndex = roundPositionReadyToScore < 8 ? 0 : 1;
  const secondRoundPositionsReadyToScore = testingSideIndex ? [1, 2] : [7, 8];

  const secondRoundDrawPositions = mainStructure.matchUps
    .filter(
      matchUp =>
        matchUp.roundNumber === 2 &&
        secondRoundPositionsReadyToScore.includes(matchUp.roundPosition)
    )
    .map(matchUp => matchUp.drawPositions)
    .flat();
  const participantIds = mainStructure.positionAssignments
    .filter(assignment =>
      secondRoundDrawPositions.includes(assignment.drawPosition)
    )
    .map(assignment => assignment.participantId);

  const losingParticipantIds = [participantIds[1], participantIds[3]];

  const completionValues = [
    [1, roundPositionReadyToScore, 2, true],
    [2, secondRoundPositionsReadyToScore[0], 1, true], // side 1 had 1st round BYE, wins matchUp
    [2, secondRoundPositionsReadyToScore[1], 1, true], // side 1 had 1st round BYE, wins matchUp
  ];

  completionValues.forEach(values => {
    const [roundNumber, roundPosition, winningSide, success] = values;
    const result = completeMatchUp({
      structureId: mainStructureId,
      roundNumber,
      roundPosition,
      winningSide,
    });
    expect(result.success).toEqual(success);
  });

  const {
    structures: [consolationStructure],
  } = drawEngine.getDrawStructures({ stage: CONSOLATION, stageSequence: 1 });

  const positionAssignmentByesCount = consolationStructure.positionAssignments.filter(
    assignment => !!assignment.bye
  ).length;
  const assignedParticipantIds = consolationStructure.positionAssignments
    .filter(assignment => !!assignment.participantId)
    .map(assignment => assignment.participantId);

  losingParticipantIds.forEach(participantId => {
    expect(assignedParticipantIds.includes(participantId)).toEqual(true);
  });
  expect(positionAssignmentByesCount).toEqual(2);
  expect(assignedParticipantIds.length).toEqual(3);
});

it('cleans up placed BYES when matchUp results are removed', () => {
  const drawSize = 32;
  const seedsCount = 8;
  const participantsCount = 17;

  const { mainStructureId } = generateFMLC({
    drawSize,
    seedsCount,
    participantsCount,
    policyDefinition: USTA_SEEDING,
  });

  const {
    structures: [mainStructure],
  } = drawEngine.getDrawStructures({ stage: MAIN, stageSequence: 1 });
  const roundPositionReadyToScore =
    Math.max(
      ...chunkArray(mainStructure.positionAssignments, 2)
        .find(pair =>
          pair.reduce(
            (ready, assignment) => assignment.participantId && ready,
            true
          )
        )
        .map(pair => pair.drawPosition)
    ) / 2;

  const testingSideIndex = roundPositionReadyToScore < 8 ? 0 : 1;
  const secondRoundPositionsReadyToScore = testingSideIndex ? [1, 2] : [7, 8];

  const secondRoundDrawPositions = mainStructure.matchUps
    .filter(
      matchUp =>
        matchUp.roundNumber === 2 &&
        secondRoundPositionsReadyToScore.includes(matchUp.roundPosition)
    )
    .map(matchUp => matchUp.drawPositions)
    .flat();
  const participantIds = mainStructure.positionAssignments
    .filter(assignment =>
      secondRoundDrawPositions.includes(assignment.drawPosition)
    )
    .map(assignment => assignment.participantId);

  const losingParticipantIds = [participantIds[1], participantIds[3]];

  const completionValues = [
    [1, roundPositionReadyToScore, 2, true],
    [2, secondRoundPositionsReadyToScore[0], 1, true], // side 1 had 1st round BYE, wins matchUp
    [2, secondRoundPositionsReadyToScore[1], 1, true], // side 1 had 1st round BYE, wins matchUp
  ];

  completionValues.forEach(values => {
    const [roundNumber, roundPosition, winningSide, success] = values;
    const result = completeMatchUp({
      structureId: mainStructureId,
      roundNumber,
      roundPosition,
      winningSide,
    });
    expect(result.success).toEqual(success);
  });

  const {
    structures: [consolationStructure],
  } = drawEngine.getDrawStructures({ stage: CONSOLATION, stageSequence: 1 });

  const positionAssignmentByesCount = consolationStructure.positionAssignments.filter(
    assignment => !!assignment.bye
  ).length;
  const assignedParticipantIds = consolationStructure.positionAssignments
    .filter(assignment => !!assignment.participantId)
    .map(assignment => assignment.participantId);

  losingParticipantIds.forEach(participantId => {
    expect(assignedParticipantIds.includes(participantId)).toEqual(true);
  });
  expect(positionAssignmentByesCount).toEqual(2);
  expect(assignedParticipantIds.length).toEqual(3);

  drawEngine.getStructureMatchUps({
    structureId: mainStructureId,
  });
});
