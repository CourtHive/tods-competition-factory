import { toBePlayed } from '../../../fixtures/scoring/outcomes/toBePlayed';
import { verifyStructure } from '../../tests/primitives/verifyStructure';
import { verifyMatchUps } from '../../tests/primitives/verifyMatchUps';

import { generateFMLC } from '../../tests/primitives/fmlc';
import tournamentEngine from '../../../tournamentEngine';
import mocksEngine from '../../../mocksEngine';

import {
  CONSOLATION,
  FIRST_MATCH_LOSER_CONSOLATION,
  MAIN,
} from '../../../constants/drawDefinitionConstants';
import { SINGLES } from '../../../constants/eventConstants';

it('can generate FMLC with double-byes in consolation', () => {
  const drawSize = 32;
  const seedsCount = 8;
  const participantsCount = 17;

  const { mainStructureId, consolationStructureId } = generateFMLC({
    drawSize,
    seedsCount,
    participantsCount,
  });

  verifyStructure({
    structureId: mainStructureId,
    expectedSeeds: 8,
    expectedSeedsWithByes: 8,
    expectedByeAssignments: 15,
    expectedPositionsAssignedCount: 32,
    expectedSeedValuesWithBye: [1, 2, 3, 4, 5, 6, 7, 8],
  });

  verifyMatchUps({
    structureId: mainStructureId,
    expectedRoundPending: [0, 1],
    expectedRoundUpcoming: [1, 7],
    expectedRoundCompleted: [0, 0],
  });

  verifyStructure({
    structureId: consolationStructureId,
    expectedSeeds: 0,
    expectedSeedsWithByes: 0,
    expectedByeAssignments: 0,
    expectedPositionsAssignedCount: 0,
    expectedSeedValuesWithBye: [],
  });

  verifyMatchUps({
    structureId: consolationStructureId,
    expectedRoundPending: [0, 4, 2, 1],
    expectedRoundUpcoming: [8, 0],
    expectedRoundCompleted: [0, 0],
    requireParticipants: false,
  });

  verifyMatchUps({
    structureId: consolationStructureId,
    expectedRoundPending: [8, 4, 2, 1],
    expectedRoundUpcoming: [0, 0],
    expectedRoundCompleted: [0, 0],
    requireParticipants: true, // requires that drawPositions be assigned to participantIds
  });
});

it('can generate FMLC with double-byes in consolation', () => {
  const drawSize = 32;
  const seedsCount = 8;
  const participantsCount = 18;

  const { mainStructureId, consolationStructureId } = generateFMLC({
    drawSize,
    seedsCount,
    participantsCount,
  });

  verifyStructure({
    structureId: mainStructureId,
    expectedSeeds: 8,
    expectedSeedsWithByes: 8,
    expectedByeAssignments: 14,
    expectedPositionsAssignedCount: 32,
    expectedSeedValuesWithBye: [1, 2, 3, 4, 5, 6, 7, 8],
  });

  verifyMatchUps({
    structureId: mainStructureId,
    expectedRoundPending: [0, 2],
    expectedRoundUpcoming: [2, 6],
    expectedRoundCompleted: [0, 0],
  });

  verifyStructure({
    structureId: consolationStructureId,
    expectedSeeds: 0,
    expectedSeedsWithByes: 0,
    expectedByeAssignments: 0,
    expectedPositionsAssignedCount: 0,
    expectedSeedValuesWithBye: [],
  });

  verifyMatchUps({
    structureId: consolationStructureId,
    expectedRoundPending: [0, 4, 2, 1],
    expectedRoundUpcoming: [8, 0],
    expectedRoundCompleted: [0, 0],
    requireParticipants: false,
  });

  verifyMatchUps({
    structureId: consolationStructureId,
    expectedRoundPending: [8, 4, 2, 1],
    expectedRoundUpcoming: [0, 0],
    expectedRoundCompleted: [0, 0],
    requireParticipants: true, // requires that drawPositions be assigned to participantIds
  });
});

it('can remove 2nd round MAIN draw result when no participant went to consolation from 2nd round', () => {
  const participantsProfile = {
    participantsCount: 16,
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
          scoreString: '6-1 6-2',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 3,
          scoreString: '6-1 6-3',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 4,
          scoreString: '6-1 6-4',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 5,
          scoreString: '6-1 6-5',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 6,
          scoreString: '6-1 7-6(3)',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 7,
          scoreString: '6-1 7-5',
          winningSide: 1,
        },
        {
          roundNumber: 2,
          roundPosition: 1,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 2,
          roundPosition: 2,
          scoreString: '6-2 6-2',
          winningSide: 1,
        },
        {
          roundNumber: 2,
          roundPosition: 3,
          scoreString: '6-2 6-3',
          winningSide: 1,
        },
        {
          roundNumber: 2,
          roundPosition: 4,
          scoreString: '6-2 6-4',
          winningSide: 1,
        },
        // now add consolation results
        {
          roundNumber: 1,
          roundPosition: 2,
          scoreString: '6-1 6-2',
          winningSide: 1,
          stage: CONSOLATION,
          stageSequence: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 3,
          scoreString: '6-1 6-3',
          winningSide: 1,
          stage: CONSOLATION,
          stageSequence: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 4,
          scoreString: '6-1 6-4',
          winningSide: 1,
          stage: CONSOLATION,
          stageSequence: 1,
        },
      ],
    },
  ];

  let {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    participantsProfile,
  });
  tournamentEngine.setState(tournamentRecord);

  // there should be 13 completed matchUps
  let { completedMatchUps } = tournamentEngine.drawMatchUps({
    drawId,
    inContext: true,
  });
  expect(completedMatchUps.length).toEqual(13);

  // target specific matchUp
  const targetMatchUp = completedMatchUps.find(
    ({ roundNumber, roundPosition, stage, stageSequence }) =>
      roundNumber === 2 &&
      roundPosition === 2 &&
      stage === MAIN &&
      stageSequence === 1
  );
  const { matchUpId, score, winningSide } = targetMatchUp;
  expect(score.scoreStringSide1).toEqual('6-2 6-2');

  // remove outcome
  let result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId,
    outcome: toBePlayed,
  });
  expect(result.success).toEqual(true);
  expect(result.matchUp.score).toBeUndefined();

  // outcome removal should be succesful => now expecting 12 completed matchUps
  ({ completedMatchUps } = tournamentEngine.drawMatchUps({ drawId }));
  expect(completedMatchUps.length).toEqual(12);

  // complete matchUp
  result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId,
    outcome: {
      score,
      winningSide,
    },
  });
  expect(result.success).toEqual(true);
  expect(result.matchUp.score).not.toBeUndefined();

  ({ completedMatchUps } = tournamentEngine.drawMatchUps({ drawId }));
  expect(completedMatchUps.length).toEqual(13);
});
