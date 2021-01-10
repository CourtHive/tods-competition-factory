import { noScoreOutcome } from '../../../fixtures/scoring/outcomes/noScoreOutcome';
import { verifyStructure } from '../../tests/primitives/verifyStructure';
import { verifyMatchUps } from '../../tests/primitives/verifyMatchUps';

import { generateFMLC } from '../../tests/primitives/fmlc';
import tournamentEngine from '../../../tournamentEngine';
import mocksEngine from '../../../mocksEngine';

import { FIRST_MATCH_LOSER_CONSOLATION } from '../../../constants/drawDefinitionConstants';
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

it.only('can remove 3rd round MAIN draw result when no participant went to consolation from 2nd round', () => {
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
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 3,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 4,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 5,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 6,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 7,
          scoreString: '6-2 6-1',
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
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 2,
          roundPosition: 3,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 2,
          roundPosition: 4,
          scoreString: '6-2 6-1',
          winningSide: 1,
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

  const { completedMatchUps } = tournamentEngine.drawMatchUps({ drawId });
  expect(completedMatchUps.length).toEqual(10);

  const matchUpId = completedMatchUps.find(
    ({ roundNumber, roundPosition }) => roundNumber === 2 && roundPosition === 2
  ).matchUpId;

  let result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId,
    outcome: noScoreOutcome,
  });
  expect(result.success).toEqual(true);
  expect(result.matchUp.score).toBeUndefined();
});
