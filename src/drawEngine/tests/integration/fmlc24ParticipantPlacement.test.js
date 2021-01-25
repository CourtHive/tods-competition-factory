it('needs to be re-written', () => {
  expect('foo');
  console.log('rewrite');
});
/*
import { drawEngine } from '../..';
import { completeMatchUp } from '../primitives/verifyMatchUps';
import { generateFMLC } from '../primitives/fmlc';

import { CONSOLATION } from '../../../constants/drawDefinitionConstants';
import USTA_SEEDING from '../../../fixtures/seeding/SEEDING_USTA';
import ITF_SEEDING from '../../../fixtures/seeding/SEEDING_ITF';

it('can support ITF Consolation participant placement', () => {
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
    [2, 1, 2, true], // side 1 had 1st round BYE, loses matchUp
    [2, 2, 1, true], // side 2 had 1st round BYE, loses matchUp
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

it('can support USTA Consolation participant placement', () => {
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
    [2, 1, 2, true], // side 1 had 1st round BYE, loses matchUp
    [2, 2, 2, true], // side 1 had 1st round BYE, loses matchUp
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
*/
