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
    audit: ({ payload }) => {
      const noticesCount = payload.notices.length;
      expect(noticesCount).toEqual(1);
      expect(payload.notices[0].topic).toEqual('audit');
      expect(payload.notices[0].payload.length).toEqual(1);
      expect(payload.notices[0].payload[0].action).toEqual(
        'deleteDrawDefinition'
      );
      expect(
        payload.notices[0].payload[0].payload.drawDefinition
      ).not.toBeUndefined();
    },
  };
  tournamentEngine.setState(tournamentRecord).setSubscriptions(subscriptions);

  let result = tournamentEngine.deleteDrawDefinitions({
    eventId,
    drawIds: [drawId],
  });
  expect(result.success).toEqual(true);
});
