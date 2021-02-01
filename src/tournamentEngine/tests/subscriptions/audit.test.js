import tournamentEngine from '../..';
import mocksEngine from '../../../mocksEngine';

it('can notify subscriber when audit information is added', () => {
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
    audit: (notices) => {
      expect(notices.length).toEqual(1);
      expect(notices[0][0].action).toEqual('deleteDrawDefinition');
      expect(notices[0][0].payload.drawDefinition).not.toBeUndefined();
    },
  };
  tournamentEngine.setState(tournamentRecord).setSubscriptions(subscriptions);

  let result = tournamentEngine.deleteDrawDefinitions({
    eventId,
    drawIds: [drawId],
  });
  expect(result.success).toEqual(true);
});
