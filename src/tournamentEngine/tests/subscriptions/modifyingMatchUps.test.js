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

  let notificationsCounter = 0;
  const subscriptions = {
    modifyMatchUp: (results) => {
      notificationsCounter += 1;
      expect(results.length).toEqual(2);
    },
  };
  let result = setSubscriptions({ subscriptions });
  expect(result.success).toEqual(true);

  tournamentEngine.setState(tournamentRecord);

  const {
    upcomingMatchUps: [{ matchUpId }],
  } = tournamentEngine.tournamentMatchUps();

  result = tournamentEngine.setMatchUpStatus({
    matchUpId,
    outcome: { winningSide: 1 },
    drawId,
  });
  expect(result.success).toEqual(true);

  expect(notificationsCounter).toEqual(1);
});
