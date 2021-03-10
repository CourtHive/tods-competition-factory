import { drawEngine } from '../../sync';
import { completeMatchUp } from '../primitives/verifyMatchUps';
import { generateFMLC } from '../primitives/firstMatchLoserConsolation';

import { CONSOLATION } from '../../../constants/drawDefinitionConstants';
import SEEDING_USTA from '../../../fixtures/policies/POLICY_SEEDING_USTA';
import SEEDING_ITF from '../../../fixtures/policies/POLICY_SEEDING_ITF';

it('can support ITF Consolation participant placement', () => {
  const drawSize = 32;
  const seedsCount = 8;
  const participantsCount = 24;

  const { mainStructureId } = generateFMLC({
    drawSize,
    seedsCount,
    participantsCount,
    policyDefinition: SEEDING_ITF,
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
  expect(positionAssignmentByesCount).toEqual(8);
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
    policyDefinition: SEEDING_USTA,
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
  expect(positionAssignmentByesCount).toEqual(8);
  expect(positionAssignmentParticipantidsCount).toEqual(4);
});
