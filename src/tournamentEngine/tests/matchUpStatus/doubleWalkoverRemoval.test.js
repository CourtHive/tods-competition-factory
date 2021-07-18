import { setSubscriptions } from '../../../global/globalState';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { MODIFY_MATCHUP } from '../../../constants/topicConstants';
import {
  DOUBLE_WALKOVER,
  TO_BE_PLAYED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';

const getTarget = ({ matchUps, roundNumber, roundPosition }) =>
  matchUps.find(
    (matchUp) =>
      matchUp.roundNumber === roundNumber &&
      matchUp.roundPosition === roundPosition
  );

// to turn on WOWO specific logging
// tournamentEngine.devContext({ WOWO: true });
/*
  drawSize: 4
  R1P1 is entered as a DOUBLE_WALKOVER, which produces a WALKOVER in R2P1
  R1P2 score is entered progressing winner to R2P1; winner of R1P2 is also winner of R2P1 by WALKOVER
  R1P2 score is removed and winner of R2P1 should be removed
*/
test('Removing a DOUBLE_WALKOVER will remove produced WALKOVER in subsequent round', () => {
  const drawProfiles = [{ drawSize: 4 }];
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });

  tournamentEngine.setState(tournamentRecord);

  // keep track of notficiations with each setMatchUpStatus event
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

  // Target R1P1 and enter a DOUBLE_WALKOVER
  let targetMatchUp = getTarget({ matchUps, roundNumber: 1, roundPosition: 1 });
  let { outcome } = mocksEngine.generateOutcomeFromScoreString({
    matchUpStatus: DOUBLE_WALKOVER,
  });
  result = tournamentEngine.setMatchUpStatus({
    matchUpId: targetMatchUp.matchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);
  expect(modifiedMatchUpLog).toEqual([
    [1, 1],
    [2, 1],
  ]);
  modifiedMatchUpLog = [];

  // R2P1 should now be a produced WALKOVER
  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  targetMatchUp = getTarget({ matchUps, roundNumber: 2, roundPosition: 1 });
  expect(targetMatchUp.drawPositions.filter(Boolean)).toEqual([]);
  expect(targetMatchUp.matchUpStatus).toEqual(WALKOVER);
  expect(targetMatchUp.winningSide).toBeUndefined();

  // now target R1P2 and set outcome with score and winningSide
  targetMatchUp = getTarget({ matchUps, roundNumber: 1, roundPosition: 2 });
  ({ outcome } = mocksEngine.generateOutcomeFromScoreString({
    scoreString: '6-1 6-2',
    winningSide: 1,
  }));
  result = tournamentEngine.setMatchUpStatus({
    matchUpId: targetMatchUp.matchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);
  expect(modifiedMatchUpLog).toEqual([
    [1, 2],
    [2, 1],
  ]);
  modifiedMatchUpLog = [];

  // expect that winner of R1P2 is progressed to and is the winner of R2P1
  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  targetMatchUp = getTarget({ matchUps, roundNumber: 2, roundPosition: 1 });
  expect(targetMatchUp.drawPositions.filter(Boolean)).toEqual([3]);
  expect(targetMatchUp.matchUpStatus).toEqual(WALKOVER);
  expect(targetMatchUp.winningSide).toEqual(2);

  targetMatchUp = getTarget({ matchUps, roundNumber: 1, roundPosition: 1 });
  ({ outcome } = mocksEngine.generateOutcomeFromScoreString({
    winningSide: undefined,
    matchUpStatus: TO_BE_PLAYED,
  }));
  result = tournamentEngine.setMatchUpStatus({
    matchUpId: targetMatchUp.matchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);
  tournamentEngine.devContext(false);
  expect(modifiedMatchUpLog).toEqual([
    [2, 1],
    [1, 1],
  ]);
  modifiedMatchUpLog = [];

  // DOUBLE_WALKOVER advanced winner is removed from R2P1
  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  targetMatchUp = getTarget({ matchUps, roundNumber: 2, roundPosition: 1 });

  expect(targetMatchUp.drawPositions.filter(Boolean)).toEqual([3]);
  expect(targetMatchUp.matchUpStatus).toEqual(TO_BE_PLAYED);
  expect(targetMatchUp.winningSide).toBeUndefined();
  expect(targetMatchUp.matchUpStatusCodes).toEqual([]);
});

test.only('DOUBLE_WALKOVER cannot be removed when active downstream matchUps', () => {
  const drawProfiles = [
    {
      drawSize: 8,
      participantsCount: 7,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 2,
          matchUpStatus: 'DOUBLE_WALKOVER',
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
          roundNumber: 2,
          roundPosition: 2,
          scoreString: '6-2 6-2',
          winningSide: 1,
        },
        {
          roundNumber: 3,
          roundPosition: 1,
          scoreString: '6-3 6-1',
          winningSide: 1,
        },
      ],
    },
  ];
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });

  tournamentEngine.setState(tournamentRecord);

  // keep track of notficiations with each setMatchUpStatus event
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

  tournamentEngine.devContext({ WOWO: true });
  let targetMatchUp = getTarget({ matchUps, roundNumber: 1, roundPosition: 2 });
  let { outcome } = mocksEngine.generateOutcomeFromScoreString({
    winningSide: undefined,
    matchUpStatus: TO_BE_PLAYED,
  });
  tournamentEngine.devContext({ WOWO: true });
  result = tournamentEngine.setMatchUpStatus({
    matchUpId: targetMatchUp.matchUpId,
    outcome,
    drawId,
  });
  console.log({ result });
});
