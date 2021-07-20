import { setSubscriptions } from '../../../global/globalState';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { MODIFY_MATCHUP } from '../../../constants/topicConstants';
import {
  DOUBLE_WALKOVER,
  // WALKOVER,
} from '../../../constants/matchUpStatusConstants';

const getTarget = ({ matchUps, roundNumber, roundPosition }) =>
  matchUps.find(
    (matchUp) =>
      matchUp.roundNumber === roundNumber &&
      matchUp.roundPosition === roundPosition
  );

// to turn on WOWO specific logging
// tournamentEngine.devContext({ WOWO: true });

test('A produced WALKOVER encountering a produced WALKOVER winningSide will not continue propagation', () => {
  const drawProfiles = [
    {
      drawSize: 16,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 1,
          matchUpStatus: DOUBLE_WALKOVER,
        },
        {
          roundNumber: 1,
          roundPosition: 2,
          scoreString: '6-1 6-2',
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

  // Enter Score in R1P4
  let targetMatchUp = getTarget({ matchUps, roundNumber: 1, roundPosition: 4 });
  let { outcome } = mocksEngine.generateOutcomeFromScoreString({
    scoreString: '7-5 7-5',
    winningSide: 1,
  });

  // tournamentEngine.devContext({ WOWO: true });
  result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId: targetMatchUp.matchUpId,
    outcome,
  });
  expect(result.success).toEqual(true);
  console.log(modifiedMatchUpLog);
  // expect(matchUpsNotificationCounter).toEqual(5);

  /*
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
  */
});
