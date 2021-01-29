import tournamentEngine from '../..';
import mocksEngine from '../../../mocksEngine';

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
    modifyMatchUp: ({ payload }) => {
      const noticesCount = payload.notices.length;
      expect(noticesCount).toEqual(1);
      expect(payload.notices[0].topic).toEqual('modifyMatchUp');
      expect(payload.notices[0].payload.matchUp).not.toBeUndefined();
    },
  };
  tournamentEngine.setState(tournamentRecord).setSubscriptions(subscriptions);

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
