import { drawEngine } from '../..';
import { completeMatchUp } from '../primitives/verifyMatchUps';
import { generateFMLC } from '../primitives/fmlc';

import { CONSOLATION } from '../../../constants/drawDefinitionConstants';
import USTA_SEEDING from '../../../fixtures/seeding/SEEDING_USTA';
import ITF_SEEDING from '../../../fixtures/seeding/SEEDING_ITF';

it('can support ITF Consolation BYE placement', () => {
  const drawSize = 32;
  const seedsCount = 8;
  const participantsCount = 24;

  const { mainStructureId } = generateFMLC({
    drawSize,
    seedsCount,
    participantsCount,
    policyDefinition: ITF_SEEDING,
  });

  const completionValues = [
    [1, 2, 2, true],
    [1, 3, 1, true],
    [2, 1, 1, true], // side 1 had 1st round BYE, wins matchUp
    [2, 2, 2, true], // side 2 had 1st round BYE, wins matchUp
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
  const positionAssignmentParticipantidsCount = consolationStructure.positionAssignments.filter(
    assignment => !!assignment.participantId
  ).length;
  expect(positionAssignmentByesCount).toEqual(2);
  expect(positionAssignmentParticipantidsCount).toEqual(2);
});

it('can support USTA Consolation BYE placement', () => {
  const drawSize = 32;
  const seedsCount = 8;
  const participantsCount = 24;

  const { mainStructureId } = generateFMLC({
    drawSize,
    seedsCount,
    participantsCount,
    policyDefinition: USTA_SEEDING,
  });

  const completionValues = [
    [1, 2, 2, true],
    [1, 4, 1, true],
    [2, 1, 1, true], // side 1 had 1st round BYE, wins matchUp
    [2, 2, 1, true], // side 1 had 1st round BYE, wins matchUp
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
  const positionAssignmentParticipantidsCount = consolationStructure.positionAssignments.filter(
    assignment => !!assignment.participantId
  ).length;
  expect(positionAssignmentByesCount).toEqual(2);
  expect(positionAssignmentParticipantidsCount).toEqual(2);
});

it('can remove BYEs when matchUps are cleared', () => {
  const drawSize = 32;
  const seedsCount = 8;
  const participantsCount = 24;

  const { mainStructureId } = generateFMLC({
    drawSize,
    seedsCount,
    participantsCount,
    policyDefinition: USTA_SEEDING,
  });

  const completionValues = [
    [1, 2, 2, true],
    [1, 4, 1, true],
    [2, 1, 1, true], // side 1 had 1st round BYE, wins matchUp
    [2, 2, 1, true], // side 1 had 1st round BYE, wins matchUp
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

  let {
    structures: [consolationStructure],
  } = drawEngine.getDrawStructures({ stage: CONSOLATION, stageSequence: 1 });

  let positionAssignmentByesCount = consolationStructure.positionAssignments.filter(
    assignment => !!assignment.bye
  ).length;
  const positionAssignmentParticipantidsCount = consolationStructure.positionAssignments.filter(
    assignment => !!assignment.participantId
  ).length;
  expect(positionAssignmentByesCount).toEqual(2);
  expect(positionAssignmentParticipantidsCount).toEqual(2);

  let result = completeMatchUp({
    structureId: mainStructureId,
    roundNumber: 2,
    roundPosition: 1,
    winningSide: undefined,
  });
  expect(result.success).toEqual(true);
  ({
    structures: [consolationStructure],
  } = drawEngine.getDrawStructures({ stage: CONSOLATION, stageSequence: 1 }));
  positionAssignmentByesCount = consolationStructure.positionAssignments.filter(
    assignment => !!assignment.bye
  ).length;
  expect(positionAssignmentByesCount).toEqual(1);

  result = completeMatchUp({
    structureId: mainStructureId,
    roundNumber: 2,
    roundPosition: 2,
    winningSide: undefined,
  });
  expect(result.success).toEqual(true);

  ({
    structures: [consolationStructure],
  } = drawEngine.getDrawStructures({ stage: CONSOLATION, stageSequence: 1 }));
  positionAssignmentByesCount = consolationStructure.positionAssignments.filter(
    assignment => !!assignment.bye
  ).length;
  expect(positionAssignmentByesCount).toEqual(0);
});
