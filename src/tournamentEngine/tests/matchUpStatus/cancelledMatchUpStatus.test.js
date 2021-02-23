import { CANCELLED } from '../../../constants/matchUpStatusConstants';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

it('supports entering CANCELED matchUpStatus', () => {
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
    outcome: { matchUpStatus: CANCELLED },
  });
  console.log({ result });
});
