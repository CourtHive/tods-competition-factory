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
    deletedMatchUpIds: (notices) => {
      expect(notices.length).toEqual(1);
      expect(notices[0].matchUpIds.length).toEqual(31);
    },
  };
  tournamentEngine.setState(tournamentRecord).setSubscriptions(subscriptions);

  let result = tournamentEngine.deleteDrawDefinitions({
    eventId,
    drawIds: [drawId],
  });
  expect(result.success).toEqual(true);
});
