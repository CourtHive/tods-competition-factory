import { setSubscriptions } from '../../../global/globalState';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { MODIFY_MATCHUP } from '../../../constants/topicConstants';
import { DOUBLE_WALKOVER } from '../../../constants/matchUpStatusConstants';

const getTarget = ({ matchUps, roundNumber, roundPosition }) =>
  matchUps.find(
    (matchUp) =>
      matchUp.roundNumber === roundNumber &&
      matchUp.roundPosition === roundPosition
  );

// to turn on WOWO specific logging
// tournamentEngine.devContext({ WOWO: true });

test('Replacing a DOUBLE_WALKOVER with an outcome including score will remove advanced participants', () => {
  const drawProfiles = [{ drawSize: 4 }];
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

  targetMatchUp = getTarget({ matchUps, roundNumber: 2, roundPosition: 1 });
  ({ outcome } = mocksEngine.generateOutcomeFromScoreString({
    scoreString: '6-1 6-2',
    winningSide: 1,
  }));
});
