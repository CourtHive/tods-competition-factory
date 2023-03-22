import { setSubscriptions } from '../../../global/state/globalState';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import { SINGLE_ELIMINATION } from '../../../constants/drawDefinitionConstants';
import { AUDIT, DELETED_MATCHUP_IDS } from '../../../constants/topicConstants';
import { MISSING_VALUE } from '../../../constants/errorConditionConstants';
import { DRAW_DELETIONS } from '../../../constants/extensionConstants';

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
    drawIds: [],
    auditData,
  });
  expect(result.error).toEqual(MISSING_VALUE);

  result = tournamentEngine.deleteDrawDefinitions({
    auditData,
    eventId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.deleteDrawDefinitions({
    drawIds: [drawId],
    auditData,
    eventId,
  });
  expect(result.success).toEqual(true);

  expect(notificationCounter).toEqual(1);
  expect(auditTrail.flat(Infinity)[0].payload.auditData).toEqual(auditData);

  const { event } = tournamentEngine.getEvent({ eventId });
  expect(event.extensions.length).toEqual(2);
  const deletions = event.extensions.find((x) => x.name === DRAW_DELETIONS);
  expect(deletions.value.length).toEqual(1);

  // now test structureReports
  const { eventStructureReports } = tournamentEngine.getStructureReports();
  const eventReport = eventStructureReports.find((e) => e.eventId === eventId);
  expect(eventReport.totalPositionManipulations).toEqual(0);
  expect(eventReport.generatedDrawsCount).toEqual(0);
  expect(eventReport.drawDeletionsCount).toEqual(1);
});
