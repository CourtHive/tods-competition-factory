import tournamentEngine from '../..';
import mocksEngine from '../../../mocksEngine';

it('can notify subscriber when drawDefinitions are deleted', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      participantsCount: 30,
    },
  ];
  const {
    drawIds: [drawId],
    eventIds: [eventId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  const subscriptions = {
    deletedMatchUpIds: ({ payload }) => {
      const noticesCount = payload.notices.length;
      expect(noticesCount).toEqual(1);
      expect(payload.notices[0].topic).toEqual('deletedMatchUpIds');
      expect(payload.notices[0].payload.matchUpIds).not.toBeUndefined();
    },
  };
  tournamentEngine.setState(tournamentRecord).setSubscriptions(subscriptions);

  let result = tournamentEngine.deleteDrawDefinitions({
    eventId,
    drawIds: [drawId],
  });
  expect(result.success).toEqual(true);
});
