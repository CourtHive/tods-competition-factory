import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import { CURTIS_CONSOLATION } from '../../../constants/drawDefinitionConstants';
import { INVALID_DRAW_SIZE } from '../../../constants/errorConditionConstants';

it('can be configured to not enforce minimum drawSize for multi-structure draws', () => {
  const result = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { drawSize: 2, drawType: CURTIS_CONSOLATION, drawTypeCoercion: false },
    ],
  });

  expect(result.error).toEqual(INVALID_DRAW_SIZE);

  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        enforceMinimumDrawSize: false,
        drawType: CURTIS_CONSOLATION,
        drawTypeCoercion: false,
        drawSize: 2,
      },
    ],
  });

  expect(drawId).not.toBeUndefined();

  tournamentEngine.setState(tournamentRecord);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.structures.length).toEqual(1);
  expect(drawDefinition.drawType).toEqual(CURTIS_CONSOLATION);
});
