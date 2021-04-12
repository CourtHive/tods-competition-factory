import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { DOUBLE_WALKOVER } from '../../../constants/matchUpStatusConstants';

it('supports entering DOUBLE_WALKOVER matchUpStatus', () => {
  // create an FMLC with the 1st position matchUp completed
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
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  const { upcomingMatchUps } = tournamentEngine.drawMatchUps({ drawId });
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
  expect(completedMatchUps.length).toEqual(1);

  console.log(pendingMatchUps[1]);
});
