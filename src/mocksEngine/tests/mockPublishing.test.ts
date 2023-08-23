import { tournamentEngine } from '../..';
import { expect, test } from 'vitest';
import mocksEngine from '..';

import { PUBLISH, STATUS } from '../../constants/timeItemConstants';

test('mocksEngine can publish generated events', () => {
  const drawProfiles = [{ drawSize: 32, publish: true }];

  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });

  tournamentEngine.setState(tournamentRecord);

  const { event } = tournamentEngine.getEvent({ drawId });

  const publishStatus = event.timeItems.find(
    (timeItem) => timeItem.itemType === `${PUBLISH}.${STATUS}`
  );

  expect(publishStatus).not.toBeUndefined();
});
