import tournamentEngine from '../../sync';
import mocksEngine from '../../../mocksEngine';

import { SINGLE_ELIMINATION } from '../../../constants/drawDefinitionConstants';
import { setSubscriptions } from '../../../global/globalState';

it('can notify subscriber when drawDefinitions are deleted', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      participantsCount: 30,
      drawType: SINGLE_ELIMINATION,
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

  let notificationCounter = 0;
  const subscriptions = {
    deletedMatchUpIds: (notices) => {
      notificationCounter += 1;
      expect(notices.length).toEqual(1);
      expect(notices[0].matchUpIds.length).toEqual(31);
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

  expect(notificationCounter).toEqual(1);

  let { timeItem } = tournamentEngine.getEventTimeItem({
    itemType: 'deleteDrawDefinitions',
    eventId,
  });
  expect(timeItem.itemValue.length).toEqual(1);
  expect(timeItem.itemValue[0].drawId).toEqual(drawId);
});
