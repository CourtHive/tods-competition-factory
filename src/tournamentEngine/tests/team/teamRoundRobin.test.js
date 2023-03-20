import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';
import { expect, test } from 'vitest';

import { ROUND_ROBIN } from '../../../constants/drawDefinitionConstants';
import { TEAM } from '../../../constants/eventConstants';

// this test originated because an error was being thrown with this scenario
test('team ROUND_robin with 3 teams', () => {
  const drawProfiles = [
    { drawSize: 3, drawType: ROUND_ROBIN, eventType: TEAM },
  ];

  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });

  tournamentEngine.setState(tournamentRecord);

  expect(tournamentRecord).not.toBeUndefined();
});
