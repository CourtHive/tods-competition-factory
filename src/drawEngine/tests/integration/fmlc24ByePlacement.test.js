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

  const {
    structures: [consolationStructure],
  } = drawEngine.getDrawStructures({ stage: CONSOLATION, stageSequence: 1 });
  const positionAssignmentByesCount = consolationStructure.positionAssignments.filter(
    (assignment) => !!assignment.bye
  ).length;
  const positionAssignmentParticipantidsCount = consolationStructure.positionAssignments.filter(
    (assignment) => !!assignment.participantId
  ).length;
  expect(positionAssignmentByesCount).toEqual(0);
  expect(positionAssignmentParticipantidsCount).toEqual(4);
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

  const {
    structures: [consolationStructure],
  } = drawEngine.getDrawStructures({ stage: CONSOLATION, stageSequence: 1 });

  const positionAssignmentByesCount = consolationStructure.positionAssignments.filter(
    (assignment) => !!assignment.bye
  ).length;
  const positionAssignmentParticipantidsCount = consolationStructure.positionAssignments.filter(
    (assignment) => !!assignment.participantId
  ).length;
  expect(positionAssignmentByesCount).toEqual(0);
  expect(positionAssignmentParticipantidsCount).toEqual(4);
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

  let completionValues = [
    [1, 2, 2, true],
    [1, 4, 1, true],
    [2, 1, 1, true], // side 1 had 1st round BYE, wins matchUp
    [2, 2, 1, true], // side 1 had 1st round BYE, wins matchUp
  ];

  checkAssignments({
    completionValues,
    structureId: mainStructureId,
    participantsCount: 4,
    byesCount: 0,
  });

  completionValues = [[2, 1, undefined, true]];

  checkAssignments({
    completionValues,
    structureId: mainStructureId,
    participantsCount: 3,
    byesCount: 0,
  });

  completionValues = [[2, 2, undefined, true]];

  checkAssignments({
    completionValues,
    structureId: mainStructureId,
    participantsCount: 2,
    byesCount: 0,
  });

  completionValues = [
    [2, 1, 2, true], // side 1 had 1st round BYE, loses matchUp
    [2, 2, 2, true], // side 1 had 1st round BYE, loses matchUp
  ];

  checkAssignments({
    completionValues,
    structureId: mainStructureId,
    participantsCount: 4,
    byesCount: 0,
  });

  completionValues = [
    [2, 1, undefined, true],
    [2, 2, undefined, true],
  ];

  checkAssignments({
    completionValues,
    structureId: mainStructureId,
    participantsCount: 2,
    byesCount: 0,
  });

  completionValues = [
    [2, 1, 1, true],
    [2, 2, 1, true],
  ];

  checkAssignments({
    completionValues,
    structureId: mainStructureId,
    participantsCount: 4,
    byesCount: 0,
  });
});

function checkAssignments({
  structureId,
  completionValues,
  participantsCount,
  byesCount,
}) {
  completionValues &&
    completionValues.forEach((values) => {
      const [roundNumber, roundPosition, winningSide, success] = values;
      const result = completeMatchUp({
        roundNumber,
        roundPosition,
        winningSide,
        structureId,
      });
      expect(result.success).toEqual(success);
    });

  const {
    structures: [consolationStructure],
  } = drawEngine.getDrawStructures({ stage: CONSOLATION, stageSequence: 1 });
  const positionAssignmentByesCount = consolationStructure.positionAssignments.filter(
    (assignment) => !!assignment.bye
  ).length;
  const positionAssignmentParticipantidsCount = consolationStructure.positionAssignments.filter(
    (assignment) => !!assignment.participantId
  ).length;
  expect(positionAssignmentByesCount).toEqual(byesCount);
  expect(positionAssignmentParticipantidsCount).toEqual(participantsCount);
}
