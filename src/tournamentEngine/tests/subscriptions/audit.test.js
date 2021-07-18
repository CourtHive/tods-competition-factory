import { setSubscriptions } from '../../../global/globalState';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { DELETE_DRAW_DEFINITIONS } from '../../../constants/auditConstants';

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

  let notificationsCounter = 0;
  const subscriptions = {
    audit: (notices) => {
      notificationsCounter += 1;
      expect(notices.length).toEqual(1);
      expect(notices[0][0].action).toEqual(DELETE_DRAW_DEFINITIONS);
      expect(notices[0][0].payload.drawDefinitions).not.toBeUndefined();
    },
  };
  let result = setSubscriptions({ subscriptions });
  expect(result.success).toEqual(true);
  tournamentEngine.setState(tournamentRecord);

  result = tournamentEngine.deleteDrawDefinitions({
    eventId,
    drawIds: [drawId],
  });
  expect(result.success).toEqual(true);

  expect(notificationsCounter).toEqual(1);
});
