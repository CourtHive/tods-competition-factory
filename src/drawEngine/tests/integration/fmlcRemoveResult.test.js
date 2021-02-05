import { toBePlayed } from '../../../fixtures/scoring/outcomes/toBePlayed';
import tournamentEngine from '../../../tournamentEngine/sync';
import { generateFMLC } from '../../tests/primitives/fmlc';
import { drawEngine } from '../../sync';
import mocksEngine from '../../../mocksEngine';
import {
  completeMatchUp,
  verifyMatchUps,
} from '../../tests/primitives/verifyMatchUps';

import {
  MAIN,
  CONSOLATION,
  FIRST_MATCH_LOSER_CONSOLATION,
} from '../../../constants/drawDefinitionConstants';
import { SINGLES } from '../../../constants/matchUpTypes';
import { MALE } from '../../../constants/genderConstants';

it('can direct winners and losers', () => {
  const drawSize = 32;
  const seedsCount = 8;
  const participantsCount = 32;

  let result;

  const { mainStructureId, consolationStructureId } = generateFMLC({
    drawSize,
    seedsCount,
    participantsCount,
  });

  verifyMatchUps({
    structureId: mainStructureId,
    expectedRoundPending: [0, 8],
    expectedRoundUpcoming: [16, 0],
    expectedRoundCompleted: [0, 0],
  });

  result = completeMatchUp({
    structureId: mainStructureId,
    roundNumber: 1,
    roundPosition: 2,
    winningSide: 2,
  });
  const { matchUpId } = result.matchUp;
  expect(result.success).toEqual(true);

  verifyMatchUps({
    structureId: mainStructureId,
    expectedRoundPending: [0, 8],
    expectedRoundUpcoming: [15, 0],
    expectedRoundCompleted: [1, 0],
  });

  let {
    structures: [consolationStructure],
  } = drawEngine.getDrawStructures({ stage: CONSOLATION, stageSequence: 1 });

  verifyMatchUps({
    structureId: consolationStructureId,
    expectedRoundPending: [8, 8, 4, 2, 1],
    expectedRoundUpcoming: [0, 0],
    expectedRoundCompleted: [0, 0],
    requireParticipants: true, // requires that drawPositions be assigned to participantIds
  });

  result = drawEngine.devContext(true).setMatchUpStatus({
    matchUpId,
    matchUpStatus: 'TO_BE_PLAYED',
    score: { sets: [] },
    winningSide: undefined,
  });

  verifyMatchUps({
    structureId: mainStructureId,
    expectedRoundPending: [0, 8],
    expectedRoundUpcoming: [16, 0],
    expectedRoundCompleted: [0, 0],
  });

  let {
    structures: [mainStructure],
  } = drawEngine.getDrawStructures({ stage: MAIN, stageSequence: 1 });
  const { structureId: verifyMainStructureId } = mainStructure;

  ({
    structures: [consolationStructure],
  } = drawEngine.getDrawStructures({ stage: CONSOLATION, stageSequence: 1 }));
  const { structureId: verifyConsolationStructureId } = consolationStructure;

  expect(
    consolationStructure.positionAssignments[1].participantId
  ).toBeUndefined();

  expect(mainStructureId).toEqual(verifyMainStructureId);
  expect(consolationStructureId).toEqual(verifyConsolationStructureId);
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

  verifyMatchUps({
    structureId: mainStructureId,
    expectedRoundPending: [0, 8],
    expectedRoundUpcoming: [14, 0],
    expectedRoundCompleted: [0, 0],
  });

  result = completeMatchUp({
    structureId: mainStructureId,
    roundNumber: 1,
    roundPosition: 2,
    winningSide: 2,
  });
  const { matchUpId } = result.matchUp;
  expect(result.success).toEqual(true);

  verifyMatchUps({
    structureId: mainStructureId,
    expectedRoundPending: [0, 7],
    expectedRoundUpcoming: [13, 1],
    expectedRoundCompleted: [1, 0],
  });

  let {
    structures: [consolationStructure],
  } = drawEngine.getDrawStructures({ stage: CONSOLATION, stageSequence: 1 });
  expect(
    consolationStructure.positionAssignments[1].participantId
  ).toBeUndefined();

  verifyMatchUps({
    structureId: consolationStructureId,
    expectedRoundPending: [6, 8, 4, 2, 1],
    expectedRoundUpcoming: [0, 0],
    expectedRoundCompleted: [0, 0],
    requireParticipants: true, // requires that drawPositions be assigned to participantIds
  });

  result = drawEngine.devContext(true).setMatchUpStatus({
    matchUpId,
    ...toBePlayed,
  });

  verifyMatchUps({
    structureId: mainStructureId,
    expectedRoundPending: [0, 7],
    expectedRoundUpcoming: [14, 1],
    expectedRoundCompleted: [0, 0],
  });

  let {
    structures: [mainStructure],
  } = drawEngine.getDrawStructures({ stage: MAIN, stageSequence: 1 });
  const { structureId: verifyMainStructureId } = mainStructure;

  ({
    structures: [consolationStructure],
  } = drawEngine.getDrawStructures({ stage: CONSOLATION, stageSequence: 1 }));
  const { structureId: verifyConsolationStructureId } = consolationStructure;
  expect(
    consolationStructure.positionAssignments[1].participantId
  ).toBeUndefined();

  expect(mainStructureId).toEqual(verifyMainStructureId);
  expect(consolationStructureId).toEqual(verifyConsolationStructureId);
});

it('can remove matchUps properly in FEED_FMLC', () => {
  const participantsProfile = {
    participantsCount: 100,
    sex: MALE,
  };
  const drawProfiles = [
    {
      drawSize: 16,
      eventType: SINGLES,
      participantsCount: 14,
      drawType: FIRST_MATCH_LOSER_CONSOLATION,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 2,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
      ],
    },
  ];
  let { tournamentRecord, drawIds } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    participantsProfile,
  });
  tournamentEngine.setState(tournamentRecord);

  const drawId = drawIds[0];

  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  drawEngine.setState(drawDefinition);

  let {
    structures: [mainStructure],
  } = drawEngine.getDrawStructures({ stage: MAIN, stageSequence: 1 });

  const { matchUps: mainDrawMatchUps } = mainStructure;
  const { matchUpId } = mainDrawMatchUps[1];

  let {
    structures: [consolationStructure],
  } = drawEngine.getDrawStructures({ stage: CONSOLATION, stageSequence: 1 });
  const { structureId: consolationStructureId } = consolationStructure;

  expect(
    consolationStructure.positionAssignments[1].participantId
  ).toBeUndefined();

  let result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId,
    outcome: toBePlayed,
  });
  expect(result.success).toEqual(true);
  expect(result.matchUp.score.scoreStringSide1).toEqual('');

  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));

  consolationStructure = drawDefinition.structures.find(
    (structure) => structure.structureId === consolationStructureId
  );

  expect(
    consolationStructure.positionAssignments[1].participantId
  ).toBeUndefined();
});
