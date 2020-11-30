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

  const completionValues = [
    [1, roundPositionReadyToScore, 2, true],
    // [2, 1, 1, true], // side 1 had 1st round BYE, wins matchUp
    // [2, 2, 2, true], // side 2 had 1st round BYE, wins matchUp
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
  console.log(consolationStructure.positionAssignments);

  const positionAssignmentByesCount = consolationStructure.positionAssignments.filter(
    assignment => !!assignment.bye
  ).length;
  const positionAssignmentParticipantidsCount = consolationStructure.positionAssignments.filter(
    assignment => !!assignment.participantId
  ).length;
  expect(positionAssignmentByesCount).toEqual(0);
  expect(positionAssignmentParticipantidsCount).toEqual(1);
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

  const completionValues = [
    [1, roundPositionReadyToScore, 2, true],
    // [1, 4, 1, true],
    // [2, 1, 1, true], // side 1 had 1st round BYE, wins matchUp
    // [2, 2, 1, true], // side 1 had 1st round BYE, wins matchUp
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
  expect(positionAssignmentByesCount).toEqual(0);
  expect(positionAssignmentParticipantidsCount).toEqual(1);
});
