import { getOrderedDrawPositionPairs } from '../../../drawEngine/tests/testingUtilities';
import { getPositionAssignments } from '../../../drawEngine/getters/positionsGetter';
import { toBePlayed } from '../../../fixtures/scoring/outcomes/toBePlayed';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { FIRST_MATCH_LOSER_CONSOLATION } from '../../../constants/drawDefinitionConstants';
import { DOUBLE_WALKOVER } from '../../../constants/matchUpStatusConstants';
import drawEngine from '../../../drawEngine/sync';

it('supports entering DOUBLE_WALKOVER matchUpStatus', () => {
  // create an FMLC with the 1st position matchUp completed
  const drawProfiles = [
    {
      drawSize: 8,
      drawType: FIRST_MATCH_LOSER_CONSOLATION,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 1,
          scoreString: '6-1 6-2',
          winningSide: 1,
        },
      ],
    },
  ];
  const {
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  // get the first upcoming matchUp, which will be { roundPosition: 2 }
  const { upcomingMatchUps } = tournamentEngine.drawMatchUps({ drawId });
  const [matchUp] = upcomingMatchUps;
  const { matchUpId, roundPosition } = matchUp;
  expect(roundPosition).toEqual(2);

  let {
    drawDefinition: {
      structures: [mainStructure, consolationStructure],
    },
  } = tournamentEngine.getEvent({ drawId });

  const mainStructureOrderedPairs = [
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [1],
    [],
    [],
  ];

  const consolationStructureOrderedPairs = [[3, 4], [5, 6], [1], [2], []];

  let { filteredOrderedPairs } = getOrderedDrawPositionPairs({
    structureId: mainStructure.structureId,
  });
  expect(filteredOrderedPairs).toEqual(mainStructureOrderedPairs);

  ({ filteredOrderedPairs } = getOrderedDrawPositionPairs({
    structureId: consolationStructure.structureId,
  }));
  expect(filteredOrderedPairs).toEqual(consolationStructureOrderedPairs);

  let result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId,
    outcome: { matchUpStatus: DOUBLE_WALKOVER },
  });
  expect(result.success).toEqual(true);

  const { matchUp: updatedMatchUp } = tournamentEngine.findMatchUp({
    drawId,
    matchUpId,
  });
  expect(updatedMatchUp.matchUpStatus).toEqual(DOUBLE_WALKOVER);

  ({
    drawDefinition: {
      structures: [mainStructure, consolationStructure],
    },
  } = tournamentEngine.getEvent({ drawId }));

  let { positionAssignments } = getPositionAssignments({
    structure: consolationStructure,
  });
  const consolationByeDrawPositions = positionAssignments
    .filter(({ bye }) => bye)
    .map(({ drawPosition }) => drawPosition);
  expect(consolationByeDrawPositions).toEqual([1, 4]);

  ({ filteredOrderedPairs } = getOrderedDrawPositionPairs({
    structureId: mainStructure.structureId,
  }));
  expect(filteredOrderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [1],
    [],
    [1],
  ]);

  ({ filteredOrderedPairs } = getOrderedDrawPositionPairs({
    structureId: consolationStructure.structureId,
  }));
  expect(filteredOrderedPairs).toEqual([[3, 4], [5, 6], [1, 3], [2], [3]]);

  // remove outcome
  result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId: matchUp.matchUpId,
    outcome: toBePlayed,
  });
  expect(result.success).toEqual(true);

  ({
    drawDefinition: {
      structures: [mainStructure, consolationStructure],
    },
  } = tournamentEngine.getEvent({ drawId }));
  ({ filteredOrderedPairs } = getOrderedDrawPositionPairs({
    structureId: mainStructure.structureId,
  }));
  expect(filteredOrderedPairs).toEqual(mainStructureOrderedPairs);
  ({ filteredOrderedPairs } = getOrderedDrawPositionPairs({
    structureId: consolationStructure.structureId,
  }));
  expect(filteredOrderedPairs).toEqual(consolationStructureOrderedPairs);
});

it('handles DOUBLE_WALKOVER for drawSize: 16', () => {
  const drawProfiles = [
    {
      drawSize: 16,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 1,
          scoreString: '6-1 6-1',
          winningSide: 1,
        },
      ],
    },
  ];
  const {
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  // get the first upcoming matchUp, which will be { roundPosition: 2 }
  const { upcomingMatchUps } = tournamentEngine.drawMatchUps({ drawId });
  const [matchUp] = upcomingMatchUps;
  const { matchUpId, roundPosition } = matchUp;
  expect(roundPosition).toEqual(2);

  let {
    drawDefinition: {
      structures: [{ structureId }],
    },
  } = tournamentEngine.getEvent({ drawId });

  let { filteredOrderedPairs } = getOrderedDrawPositionPairs({ structureId });
  expect(filteredOrderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [9, 10],
    [11, 12],
    [13, 14],
    [15, 16],
    [1],
    [],
    [],
    [],
    [],
    [],
    [],
  ]);

  let result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId,
    outcome: { matchUpStatus: DOUBLE_WALKOVER },
  });
  expect(result.success).toEqual(true);

  ({ filteredOrderedPairs } = getOrderedDrawPositionPairs({ structureId }));

  expect(filteredOrderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [9, 10],
    [11, 12],
    [13, 14],
    [15, 16],
    [1],
    [],
    [],
    [],
    [1],
    [],
    [],
  ]);
});

it('advanceds a DOUBLE_WALKOVER when encountering DOUBLE DOUBLE_WALKOVER', () => {
  const drawProfiles = [
    {
      drawSize: 16,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 1,
          scoreString: '6-1 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 2,
          scoreString: '6-1 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 3,
          matchUpStatus: DOUBLE_WALKOVER,
        },
      ],
    },
  ];
  const {
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  let {
    drawDefinition: {
      structures: [{ structureId }],
    },
  } = tournamentEngine.getEvent({ drawId });

  const preWalkover = [
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [9, 10],
    [11, 12],
    [13, 14],
    [15, 16],
    [1, 3],
    [],
    [],
    [],
    [],
    [],
    [],
  ];

  let { filteredOrderedPairs } = getOrderedDrawPositionPairs({ structureId });
  expect(filteredOrderedPairs).toEqual(preWalkover);

  let { matchUps } = tournamentEngine.allTournamentMatchUps();
  const targetMatchUp = matchUps.find(
    ({ roundNumber, roundPosition }) => roundNumber === 1 && roundPosition === 4
  );
  let result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId: targetMatchUp.matchUpId,
    outcome: { matchUpStatus: DOUBLE_WALKOVER },
  });
  expect(result.success).toEqual(true);

  ({ filteredOrderedPairs } = getOrderedDrawPositionPairs({ structureId }));
  expect(filteredOrderedPairs).toEqual(preWalkover);

  ({ matchUps } = tournamentEngine.allTournamentMatchUps());

  const { roundMatchUps } = drawEngine.getRoundMatchUps({ matchUps });
  expect(roundMatchUps[1].map(({ matchUpStatus }) => matchUpStatus)).toEqual([
    'COMPLETED',
    'COMPLETED',
    'DOUBLE_WALKOVER',
    'DOUBLE_WALKOVER',
    'TO_BE_PLAYED',
    'TO_BE_PLAYED',
    'TO_BE_PLAYED',
    'TO_BE_PLAYED',
  ]);
  expect(roundMatchUps[2].map(({ matchUpStatus }) => matchUpStatus)).toEqual([
    'TO_BE_PLAYED',
    'DOUBLE_WALKOVER',
    'TO_BE_PLAYED',
    'TO_BE_PLAYED',
  ]);
});

it('handles DOUBLE DOUBLE_WALKOVER advancement', () => {
  const drawProfiles = [
    {
      drawSize: 16,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 1,
          scoreString: '6-1 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 2,
          scoreString: '6-1 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 3,
          matchUpStatus: DOUBLE_WALKOVER,
        },
        {
          roundNumber: 1,
          roundPosition: 4,
          matchUpStatus: DOUBLE_WALKOVER,
        },
      ],
    },
  ];
  const {
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  let {
    drawDefinition: {
      structures: [{ structureId }],
    },
  } = tournamentEngine.getEvent({ drawId });

  let { filteredOrderedPairs } = getOrderedDrawPositionPairs({ structureId });
  expect(filteredOrderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [9, 10],
    [11, 12],
    [13, 14],
    [15, 16],
    [1, 3],
    [],
    [],
    [],
    [],
    [],
    [],
  ]);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  const targetMatchUp = matchUps.find(
    ({ roundNumber, roundPosition }) => roundNumber === 2 && roundPosition === 1
  );
  const { outcome } = mocksEngine.generateOutcomeFromScoreString({
    scoreString: '7-5 7-5',
    winningSide: 1,
  });
  let result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId: targetMatchUp.matchUpId,
    outcome,
  });
  expect(result.success).toEqual(true);

  ({ filteredOrderedPairs } = getOrderedDrawPositionPairs({ structureId }));
  expect(filteredOrderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [9, 10],
    [11, 12],
    [13, 14],
    [15, 16],
    [1, 3],
    [],
    [],
    [],
    [1],
    [],
    [1],
  ]);
});
