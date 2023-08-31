import { findExtension } from '../../../global/functions/deducers/findExtension';
import { setSubscriptions } from '../../../global/state/globalState';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import { DELETE_DRAW_DEFINITIONS } from '../../../constants/auditConstants';
import { DRAW_DELETIONS } from '../../../constants/extensionConstants';

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
    drawIds: [drawId],
    eventId,
  });
  expect(result.success).toEqual(true);

  const { event } = tournamentEngine.getEvent({ drawId });
  const { extension } = findExtension({
    name: DRAW_DELETIONS,
    element: event,
  });
  expect(extension?.value?.length).toEqual(1);
  expect(
    extension?.value[0].deletedDrawsDetail[0].positionAssignments
  ).not.toBeUndefined();

  expect(notificationsCounter).toEqual(1);

  // now test structureReports
  const { eventStructureReports } = tournamentEngine.getStructureReports();
  const eventReport = eventStructureReports.find((e) => e.eventId === eventId);
  expect(eventReport.totalPositionManipulations).toEqual(0);
  expect(eventReport.generatedDrawsCount).toEqual(0);
  expect(eventReport.drawDeletionsCount).toEqual(1);
});
