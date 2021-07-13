import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { DOUBLE_WALKOVER } from '../../../constants/matchUpStatusConstants';

it('supports entering DOUBLE_WALKOVER matchUpStatus', () => {
  const drawProfiles = [
    {
      drawSize: 4,
      outcomes: [
        {
          roundNumber: 1,
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

  const { upcomingMatchUps } = tournamentEngine
    .setState(tournamentRecord)
    .drawMatchUps({ drawId });
  const [matchUp] = upcomingMatchUps;
  const { matchUpId, roundPosition } = matchUp;

  expect(roundPosition).toEqual(2);

  const { outcome } = mocksEngine.generateOutcomeFromScoreString({
    scoreString: '6-1 6-2',
    winningSide: 1,
  });
  let result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId,
    outcome,
  });
  expect(result.success).toEqual(true);

  const { completedMatchUps, pendingMatchUps } = tournamentEngine.drawMatchUps({
    drawId,
  });
  expect(completedMatchUps.length).toEqual(2);

  console.log(pendingMatchUps);
});
