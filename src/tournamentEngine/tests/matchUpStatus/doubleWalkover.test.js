import { getOrderedDrawPositionPairs } from '../../../drawEngine/tests/testingUtilities';
import { getPositionAssignments } from '../../../drawEngine/getters/positionsGetter';
import { toBePlayed } from '../../../fixtures/scoring/outcomes/toBePlayed';
import { setSubscriptions } from '../../../global/globalState';
import drawEngine from '../../../drawEngine/sync';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { FIRST_MATCH_LOSER_CONSOLATION } from '../../../constants/drawDefinitionConstants';
import { MODIFY_MATCHUP } from '../../../constants/topicConstants';
import {
  BYE,
  DOUBLE_WALKOVER,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';

const getTarget = ({ matchUps, roundNumber, roundPosition }) =>
  matchUps.find(
    (matchUp) =>
      matchUp.roundNumber === roundNumber &&
      matchUp.roundPosition === roundPosition
  );

// tournamentEngine.devContext({ WOWO: true });

// duplicate this test but reverse the order of scoring; enter WO/WO second
test.only('A DOUBLE_WALKOVER will create a WALKOVER', () => {
  const drawProfiles = [{ drawSize: 16 }];
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });

  tournamentEngine.setState(tournamentRecord);

  let matchUpsNotificationCounter = 0;
  let result = setSubscriptions({
    subscriptions: {
      [MODIFY_MATCHUP]: (matchUps) => {
        matchUpsNotificationCounter += matchUps?.length || 0;
      },
    },
  });
  expect(result.success).toEqual(true);

  let { matchUps } = tournamentEngine.allTournamentMatchUps();

  // Enter DOUBLE_WALKOVER in R1P1
  let targetMatchUp = getTarget({ matchUps, roundNumber: 1, roundPosition: 1 });
  result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId: targetMatchUp.matchUpId,
    outcome: { matchUpStatus: DOUBLE_WALKOVER },
  });
  expect(result.success).toEqual(true);

  expect(matchUpsNotificationCounter).toEqual(2);

  // Enter Score in R1P2 advancing DP3
  targetMatchUp = getTarget({ matchUps, roundNumber: 1, roundPosition: 2 });
  let { outcome } = mocksEngine.generateOutcomeFromScoreString({
    scoreString: '7-5 7-5',
    winningSide: 1,
  });

  result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId: targetMatchUp.matchUpId,
    outcome,
  });
  expect(result.success).toEqual(true);
  expect(matchUpsNotificationCounter).toEqual(5);

  // Expect R2P1 to have only DP3 with winningSide: 2
  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  targetMatchUp = getTarget({ matchUps, roundNumber: 2, roundPosition: 1 });
  expect(targetMatchUp.drawPositions.filter(Boolean)).toEqual([3]);
  expect(targetMatchUp.winningSide).toEqual(2);

  targetMatchUp = getTarget({ matchUps, roundNumber: 1, roundPosition: 2 });
  ({ outcome } = mocksEngine.generateOutcomeFromScoreString({
    scoreString: '6-3 6-3',
    winningSide: 2,
  }));

  // Change R1P2 winningSide (allowChangePropagation: true)
  result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId: targetMatchUp.matchUpId,
    allowChangePropagation: true,
    outcome,
  });
  expect(result.success).toEqual(true);

  expect(matchUpsNotificationCounter).toEqual(8);

  // expect that the winning side has been updated to 2 and is now DP4
  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  targetMatchUp = getTarget({ matchUps, roundNumber: 2, roundPosition: 1 });
  expect(targetMatchUp.drawPositions.filter(Boolean)).toEqual([4]);
  expect(targetMatchUp.winningSide).toEqual(2);
});

/*
  R1P1 matchUp is BYE.  Enters three DOUBLE_WALKOVERs in remaining first round matchUps.
  Entering WOWO in R1P2 produces WALKOVER in R2P1 and advances DP1 to 3rd round. 
  Entering WOWO in R1P3 produces WALKOVER in R2P2. 
  Entering WOWO in R1P4 converts R2P2 to DOUBLE_WALKOVER and produces WALKOVER in R3P1. 
*/
test.only('DOUBLE DOUBLE_WALKOVERs will convert a produced WALKOVER into a DOUBLE_WALKOVER', () => {
  const drawProfiles = [{ drawSize: 8, participantsCount: 7 }];
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });
  tournamentEngine.setState(tournamentRecord);

  let modifiedMatchUpLog = [];
  let result = setSubscriptions({
    subscriptions: {
      [MODIFY_MATCHUP]: (matchUps) => {
        matchUps.forEach(({ matchUp }) =>
          modifiedMatchUpLog.push([matchUp.roundNumber, matchUp.roundPosition])
        );
      },
    },
  });
  expect(result.success).toEqual(true);

  let { matchUps } = tournamentEngine.allTournamentMatchUps();
  let targetMatchUp = getTarget({ matchUps, roundNumber: 1, roundPosition: 1 });
  expect(targetMatchUp.matchUpStatus).toEqual(BYE);

  // Enter DOUBLE_WALKOVER in R1P2
  targetMatchUp = getTarget({ matchUps, roundNumber: 1, roundPosition: 2 });
  result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId: targetMatchUp.matchUpId,
    outcome: { matchUpStatus: DOUBLE_WALKOVER },
  });
  expect(modifiedMatchUpLog).toEqual([
    [1, 2],
    [2, 1],
    [3, 1],
  ]);
  modifiedMatchUpLog = [];

  // Check that R2P1 is a produced WALKOVER
  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  targetMatchUp = getTarget({ matchUps, roundNumber: 2, roundPosition: 1 });
  expect(targetMatchUp.matchUpStatus).toEqual(WALKOVER);

  // Enter DOUBLE_WALKOVER in R1P3
  targetMatchUp = getTarget({ matchUps, roundNumber: 1, roundPosition: 3 });
  result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId: targetMatchUp.matchUpId,
    outcome: { matchUpStatus: DOUBLE_WALKOVER },
  });
  expect(modifiedMatchUpLog).toEqual([
    [1, 3],
    [2, 2],
  ]);
  modifiedMatchUpLog = [];

  // Produces WALKOVER in R2P2
  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  targetMatchUp = getTarget({ matchUps, roundNumber: 2, roundPosition: 2 });
  expect(targetMatchUp.matchUpStatus).toEqual(WALKOVER);

  // Enter DOUBLE_WALKOVER in R1P4
  targetMatchUp = getTarget({ matchUps, roundNumber: 1, roundPosition: 4 });
  result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId: targetMatchUp.matchUpId,
    outcome: { matchUpStatus: DOUBLE_WALKOVER },
  });
  expect(modifiedMatchUpLog).toEqual([
    [1, 4],
    [2, 2],
    [3, 1],
  ]);

  // Converts WALKOVER to DOUBLE_WALKOVER in R2P2
  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  targetMatchUp = getTarget({ matchUps, roundNumber: 2, roundPosition: 2 });
  expect(targetMatchUp.matchUpStatus).toEqual(DOUBLE_WALKOVER);

  // Produces WALKOVER in R3P1, advances DP1 to Final, sets winningSide
  targetMatchUp = getTarget({ matchUps, roundNumber: 3, roundPosition: 1 });
  expect(targetMatchUp.drawPositions.filter(Boolean)).toEqual([1]);
  expect(targetMatchUp.matchUpStatus).toEqual(WALKOVER);
  expect(targetMatchUp.winningSide).toEqual(1);
});

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
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  // get the first upcoming matchUp, which will be { roundPosition: 2 }
  const { upcomingMatchUps } = tournamentEngine
    .setState(tournamentRecord)
    .drawMatchUps({ drawId });
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

  let result = tournamentEngine.setMatchUpStatus({
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
  result = tournamentEngine.setMatchUpStatus({
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

/*
Generate SINGLE_ELIMINATION drawSize: 16 and complete r1p1 with score
*/
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
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  tournamentEngine.setState(tournamentRecord);

  // get the first upcoming matchUp
  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  let { matchUpId } = getTarget({ matchUps, roundNumber: 1, roundPosition: 2 });

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

  let result = tournamentEngine.setMatchUpStatus({
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
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  let {
    drawDefinition: {
      structures: [{ structureId }],
    },
  } = tournamentEngine.setState(tournamentRecord).getEvent({ drawId });

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
  let result = tournamentEngine.setMatchUpStatus({
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
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  let {
    drawDefinition: {
      structures: [{ structureId }],
    },
  } = tournamentEngine.setState(tournamentRecord).getEvent({ drawId });

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
  let result = tournamentEngine.setMatchUpStatus({
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

it('handles advances when encountring consecutive DOUBLE_WALKOVERs', () => {
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
          roundNumber: 2,
          roundPosition: 1,
          matchUpStatus: DOUBLE_WALKOVER,
        },
      ],
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  let {
    drawDefinition: {
      structures: [{ structureId }],
    },
  } = tournamentEngine.setState(tournamentRecord).getEvent({ drawId });

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
    ({ roundNumber, roundPosition }) => roundNumber === 1 && roundPosition === 4
  );
  const { outcome } = mocksEngine.generateOutcomeFromScoreString({
    scoreString: '7-5 7-5',
    winningSide: 1,
  });
  let result = tournamentEngine.setMatchUpStatus({
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
    [7],
    [],
    [],
    [7],
    [],
    [7],
  ]);
});
