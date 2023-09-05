import { getSeedsCount } from '../../governors/policyGovernor/getSeedsCount';
import { expect, it } from 'vitest';

import SEEDING_USTA from '../../../fixtures/policies/POLICY_SEEDING_USTA';
import { POLICY_TYPE_SEEDING } from '../../../constants/policyConstants';
import { CLUSTER } from '../../../constants/drawDefinitionConstants';
import {
  INVALID_POLICY_DEFINITION,
  INVALID_VALUES,
  MISSING_DRAW_SIZE,
  MISSING_PARTICIPANT_COUNT,
  MISSING_SEEDCOUNT_THRESHOLDS,
  POLICY_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

it('can accurately determine seedsCount from drawSize and participantsCount', () => {
  let seedsCount, error;
  ({ seedsCount, error } = getSeedsCount());
  expect(seedsCount).toEqual(undefined);
  expect(error).toEqual(POLICY_NOT_FOUND);

  ({ seedsCount, error } = getSeedsCount({ policyDefinitions: SEEDING_USTA }));
  expect(seedsCount).toEqual(undefined);
  expect(error).toEqual(MISSING_PARTICIPANT_COUNT);

  ({ seedsCount, error } = getSeedsCount({
    policyDefinitions: SEEDING_USTA,
    participantsCount: 'fifteen',
  }));
  expect(error).toEqual(INVALID_VALUES);

  ({ seedsCount, error } = getSeedsCount({
    requireParticipantCount: false,
    policyDefinitions: SEEDING_USTA,
  }));
  expect(error).toEqual(MISSING_DRAW_SIZE);

  ({ seedsCount, error } = getSeedsCount({
    policyDefinitions: {},
    participantsCount: 15,
  }));
  expect(error).toEqual(INVALID_POLICY_DEFINITION);

  let policyDefinitions: any = {
    [POLICY_TYPE_SEEDING]: {
      seedingProfile: { positioning: CLUSTER },
      duplicateSeedNumbers: true,
    },
  };

  ({ seedsCount, error } = getSeedsCount({
    policyDefinitions,
    participantsCount: 15,
  }));
  expect(error).toEqual(MISSING_SEEDCOUNT_THRESHOLDS);

  policyDefinitions = {
    [POLICY_TYPE_SEEDING]: {
      seedingProfile: { positioning: CLUSTER },
      duplicateSeedNumbers: true,
      seedsCountThresholds: [
        { drawSize: 4, minimumParticipantCount: 3, seedsCount: 2 },
      ],
    },
  };

  ({ seedsCount, error } = getSeedsCount({
    policyDefinitions,
    participantsCount: 15,
  }));
  // expect 0 because there is no drawSizeProgression and no appropriate threshold
  expect(seedsCount).toEqual(0);

  ({ seedsCount, error } = getSeedsCount({
    drawSizeProgression: true,
    policyDefinitions,
    participantsCount: 15,
  }));
  // expect 2 because { drawSizeProgression: true }
  expect(seedsCount).toEqual(2);

  ({ seedsCount, error } = getSeedsCount({
    policyDefinitions: SEEDING_USTA,
    participantsCount: 15,
  }));
  expect(seedsCount).toEqual(4);

  ({ seedsCount, error } = getSeedsCount({
    policyDefinitions: SEEDING_USTA,
    participantsCount: 15,
    drawSize: 16,
  }));
  expect(seedsCount).toEqual(4);

  ({ seedsCount, error } = getSeedsCount({
    policyDefinitions: SEEDING_USTA,
    participantsCount: 15,
    drawSize: 128,
  }));
  expect(seedsCount).toEqual(4);

  ({ seedsCount, error } = getSeedsCount({
    policyDefinitions: SEEDING_USTA,
    participantsCount: 64,
    drawSize: 128,
  }));
  expect(seedsCount).toEqual(16);

  ({ seedsCount, error } = getSeedsCount({
    policyDefinitions: SEEDING_USTA,
    participantsCount: 65,
    drawSize: 128,
  }));
  expect(seedsCount).toEqual(16);

  ({ seedsCount, error } = getSeedsCount({
    policyDefinitions: SEEDING_USTA,
    participantsCount: 97,
    drawSize: 128,
  }));
  expect(seedsCount).toEqual(32);

  ({ seedsCount, error } = getSeedsCount({
    policyDefinitions: SEEDING_USTA,
    drawSizeProgression: true,
    participantsCount: 16,
    drawSize: 128,
  }));
  expect(seedsCount).toEqual(4);
});
