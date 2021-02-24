import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { DOUBLE_WALKOVER } from '../../../constants/matchUpStatusConstants';

it('supports entering DOUBLE_WALKOVER matchUpStatus', () => {
  const drawProfiles = [
    {
      drawSize: 8,
    },
  ];
  const {
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  const { upcomingMatchUps } = tournamentEngine.drawMatchUps({ drawId });
  const matchUpId = upcomingMatchUps[0].matchUpId;

  const result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId,
    outcome: { matchUpStatus: DOUBLE_WALKOVER },
  });
  expect(result.success).toEqual(true);

  const { matchUp } = tournamentEngine.findMatchUp({ drawId, matchUpId });
  expect(matchUp.matchUpStatus).toEqual(DOUBLE_WALKOVER);
});
