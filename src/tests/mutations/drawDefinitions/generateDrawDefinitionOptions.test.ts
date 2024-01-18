import mocksEngine from '../../../assemblies/engines/mock';
import tournamentEngine from '../../engines/syncEngine';
import { expect, it, test } from 'vitest';

import {
  AD_HOC,
  CURTIS_CONSOLATION,
  ROUND_ROBIN_WITH_PLAYOFF,
  SINGLE_ELIMINATION,
} from '../../../constants/drawDefinitionConstants';
import { INVALID_DRAW_SIZE } from '../../../constants/errorConditionConstants';

it('can be configured to not enforce minimum drawSize for multi-structure draws', () => {
  const result = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 2, drawType: CURTIS_CONSOLATION, drawTypeCoercion: false }],
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

const scenarios = [
  {
    drawProfile: { drawType: AD_HOC, drawSize: 2 },
    drawTypeCoercion: { AD_HOC: false },
    expectation: { drawType: AD_HOC },
  },
  {
    drawProfile: { drawType: AD_HOC, drawSize: 2 },
    expectation: { drawType: SINGLE_ELIMINATION },
    drawTypeCoercion: { AD_HOC: true },
  },
  {
    drawProfile: { drawType: ROUND_ROBIN_WITH_PLAYOFF, drawSize: 4 },
    drawTypeCoercion: { ROUND_ROBIN_WITH_PLAYOFF: false },
    expectation: { drawType: ROUND_ROBIN_WITH_PLAYOFF },
  },
  {
    drawProfile: { drawType: ROUND_ROBIN_WITH_PLAYOFF, drawSize: 4 },
    drawTypeCoercion: { ROUND_ROBIN_WITH_PLAYOFF: 5 },
    expectation: { drawType: SINGLE_ELIMINATION },
  },
];

test.skip.each(scenarios)('drawTypeCoercion can be configured to coerce all drawTypes', (scenario) => {
  const result = mocksEngine.generateTournamentRecord({
    policyDefinitions: { POLICY_TYPE_DRAWS: { drawTypeCoercion: scenario.drawTypeCoercion } },
    drawProfiles: [{ ...scenario.drawProfile, drawId: 'drawId' }],
    setState: true,
  });
  expect(result.success).toEqual(true);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId: 'drawId' });
  expect(drawDefinition.drawType).toEqual(scenario.expectation.drawType);
});
