import { drawEngine } from '../../sync';
import { completeMatchUp } from '../primitives/verifyMatchUps';
import { generateFMLC } from '../primitives/firstMatchLoserConsolation';

import {
  CONSOLATION,
  FIRST_MATCH_LOSER_CONSOLATION,
  MAIN,
} from '../../../constants/drawDefinitionConstants';
import SEEDING_USTA from '../../../fixtures/policies/POLICY_SEEDING_USTA';
import SEEDING_ITF from '../../../fixtures/policies/POLICY_SEEDING_ITF';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../../tournamentEngine/sync';
import { instanceCount } from '../../../utilities';

it('can support ITF Consolation BYE placement', () => {
  const drawSize = 32;
  const seedsCount = 8;
  const participantsCount = 24;

  const { mainStructureId } = generateFMLC({
    drawSize,
    seedsCount,
    participantsCount,
    policyDefinitions: SEEDING_ITF,
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
  const positionAssignmentByesCount =
    consolationStructure.positionAssignments.filter(
      (assignment) => !!assignment.bye
    ).length;
  const positionAssignmentParticipantidsCount =
    consolationStructure.positionAssignments.filter(
      (assignment) => !!assignment.participantId
    ).length;
  expect(positionAssignmentByesCount).toEqual(10);
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
    policyDefinitions: SEEDING_USTA,
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

  const positionAssignmentByesCount =
    consolationStructure.positionAssignments.filter(
      (assignment) => !!assignment.bye
    ).length;
  const positionAssignmentParticipantidsCount =
    consolationStructure.positionAssignments.filter(
      (assignment) => !!assignment.participantId
    ).length;
  expect(positionAssignmentByesCount).toEqual(10);
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
    policyDefinitions: SEEDING_USTA,
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
    participantsCount: 2,
    byesCount: 10,
  });

  completionValues = [[2, 1, undefined, true]];

  checkAssignments({
    completionValues,
    structureId: mainStructureId,
    participantsCount: 2,
    byesCount: 9,
  });

  completionValues = [[2, 2, undefined, true]];

  checkAssignments({
    completionValues,
    structureId: mainStructureId,
    participantsCount: 2,
    byesCount: 8,
  });

  completionValues = [
    [2, 1, 2, true], // side 1 had 1st round BYE, loses matchUp
    [2, 2, 2, true], // side 1 had 1st round BYE, loses matchUp
  ];

  checkAssignments({
    completionValues,
    structureId: mainStructureId,
    participantsCount: 4,
    byesCount: 8,
  });

  completionValues = [
    [2, 1, undefined, true],
    [2, 2, undefined, true],
  ];

  checkAssignments({
    completionValues,
    structureId: mainStructureId,
    participantsCount: 2,
    byesCount: 8,
  });

  completionValues = [
    [2, 1, 1, true],
    [2, 2, 1, true],
  ];

  checkAssignments({
    completionValues,
    structureId: mainStructureId,
    participantsCount: 2,
    byesCount: 10,
  });
});

it('can remove BYEs when matchUps are cleared', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      participantsCount: 17,
      seedsCount: 8,
      drawType: FIRST_MATCH_LOSER_CONSOLATION,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });
  tournamentEngine.setState(tournamentRecord);
  let { upcomingMatchUps } = tournamentEngine.drawMatchUps({
    drawId,
    inContext: true,
    constextFilters: { stages: [MAIN] },
  });
  expect(upcomingMatchUps.length).toEqual(8);
  const secondRoundUpcoming = upcomingMatchUps.filter(
    ({ roundNumber }) => roundNumber === 2
  );
  expect(secondRoundUpcoming.length).toEqual(7);

  let { byeMatchUps } = tournamentEngine.drawMatchUps({
    drawId,
    inContext: true,
    contextFilters: { stages: [CONSOLATION] },
  });
  expect(byeMatchUps.length).toEqual(15);
  expect(instanceCount(byeMatchUps.map((m) => m.matchUpStatus)).BYE).toEqual(
    15
  );

  let {
    drawDefinition: {
      structures: [mainStructure, consolationStructure],
    },
  } = tournamentEngine.getEvent({ drawId });
  let mainByePositionAssignments = mainStructure.positionAssignments.filter(
    ({ bye }) => bye
  );
  expect(mainByePositionAssignments.length).toEqual(15);
  let consolationByePositionAssignments =
    consolationStructure.positionAssignments.filter(({ bye }) => bye);
  expect(consolationByePositionAssignments.length).toEqual(15);

  secondRoundUpcoming.forEach(({ matchUpId }) => {
    let result = tournamentEngine.setMatchUpStatus({
      matchUpId,
      outcome: { winningSide: 1 },
      drawId,
    });
    expect(result.success).toEqual(true);
    result = tournamentEngine.setMatchUpStatus({
      matchUpId,
      outcome: { winningSide: 2 },
      drawId,
    });
    expect(result.success).toEqual(true);
  });

  ({ byeMatchUps } = tournamentEngine.drawMatchUps({
    drawId,
    inContext: true,
    contextFilters: { stages: [CONSOLATION] },
  }));
  expect(byeMatchUps.length).toEqual(15);
  expect(instanceCount(byeMatchUps.map((m) => m.matchUpStatus)).BYE).toEqual(
    15
  );

  ({
    drawDefinition: {
      structures: [mainStructure, consolationStructure],
    },
  } = tournamentEngine.getEvent({ drawId }));
  mainByePositionAssignments = mainStructure.positionAssignments.filter(
    ({ bye }) => bye
  );
  expect(mainByePositionAssignments.length).toEqual(15);
  consolationByePositionAssignments =
    consolationStructure.positionAssignments.filter(({ bye }) => bye);
  expect(consolationByePositionAssignments.length).toEqual(15);
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
  const positionAssignmentByesCount =
    consolationStructure.positionAssignments.filter(
      (assignment) => !!assignment.bye
    ).length;
  const positionAssignmentParticipantidsCount =
    consolationStructure.positionAssignments.filter(
      (assignment) => !!assignment.participantId
    ).length;
  expect(positionAssignmentByesCount).toEqual(byesCount);
  expect(positionAssignmentParticipantidsCount).toEqual(participantsCount);
}
