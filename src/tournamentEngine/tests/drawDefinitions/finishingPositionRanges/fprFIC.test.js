import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../sync';
import { expect, it } from 'vitest';

import { FEED_IN_CHAMPIONSHIP } from '../../../../constants/drawDefinitionConstants';

it('generates correct finishingPositionRanges for FEED_IN_CHAMPIONSHIP', () => {
  let { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawType: FEED_IN_CHAMPIONSHIP, drawSize: 16 }],
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);
});
