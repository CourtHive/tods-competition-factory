import tournamentEngine from '../../sync';
import mocksEngine from '../../../mocksEngine';

import { SINGLE_ELIMINATION } from '../../../constants/drawDefinitionConstants';
import { setSubscriptions } from '../../../global/globalState';
import { AUDIT, DELETED_MATCHUP_IDS } from '../../../constants/topicConstants';

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

  let auditTrail = [];
  let notificationCounter = 0;
  const subscriptions = {
    [AUDIT]: (trail) => {
      auditTrail.push(trail);
    },
    [DELETED_MATCHUP_IDS]: (notices) => {
      notificationCounter += 1;
      expect(notices.length).toEqual(1);
      expect(notices[0].matchUpIds.length).toEqual(31);
    },
  };
  let result = setSubscriptions({ subscriptions });
  expect(result.success).toEqual(true);

  tournamentEngine.setState(tournamentRecord);

  const auditData = { userId: 'user123', reason: 'I wanted to' };
  result = tournamentEngine.deleteDrawDefinitions({
    eventId,
    drawIds: [drawId],
    auditData,
  });
  expect(result.success).toEqual(true);

  expect(notificationCounter).toEqual(1);
  expect(auditTrail.flat(Infinity)[0].payload.auditData).toEqual(auditData);

  let { timeItem } = tournamentEngine.getEventTimeItem({
    itemType: 'deleteDrawDefinitions',
    eventId,
  });
  expect(timeItem.itemValue.length).toEqual(1);
  expect(timeItem.itemValue[0].drawId).toEqual(drawId);
  expect(timeItem.itemValue[0].auditData).toEqual(auditData);
});
