import tournamentEngine from '../../sync';
import mocksEngine from '../../../mocksEngine';
import { setSubscriptions } from '../../../global/globalState';

it('can notify subscriber when matchUps are modified', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      participantsCount: 30,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  const subscriptions = {
    modifyMatchUp: (results) => {
      expect(results.length).toEqual(2);
    },
  };
  setSubscriptions(subscriptions);

  tournamentEngine.setState(tournamentRecord);

  const {
    upcomingMatchUps: [{ matchUpId }],
  } = tournamentEngine.tournamentMatchUps();

  let result = tournamentEngine.setMatchUpStatus({
    matchUpId,
    outcome: { winningSide: 1 },
    drawId,
  });
  expect(result.success).toEqual(true);
});
