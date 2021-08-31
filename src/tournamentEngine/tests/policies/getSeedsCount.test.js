import { getSeedsCount } from '../../governors/policyGovernor/getSeedsCount';

import SEEDING_USTA from '../../../fixtures/policies/POLICY_SEEDING_USTA';
import {
  MISSING_PARTICIPANT_COUNT,
  POLICY_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

it('can accurately determine seedsCount from drawSize and participantCount', () => {
  let seedsCount, error;
  ({ seedsCount, error } = getSeedsCount());
  expect(seedsCount).toEqual(undefined);
  expect(error).toEqual(POLICY_NOT_FOUND);

  ({ seedsCount, error } = getSeedsCount({ policyDefinitions: SEEDING_USTA }));
  expect(seedsCount).toEqual(undefined);
  expect(error).toEqual(MISSING_PARTICIPANT_COUNT);

  ({ seedsCount, error } = getSeedsCount({
    policyDefinitions: SEEDING_USTA,
    participantCount: 15,
  }));
  expect(seedsCount).toEqual(4);

  ({ seedsCount, error } = getSeedsCount({
    policyDefinitions: SEEDING_USTA,
    participantCount: 15,
    drawSize: 16,
  }));
  expect(seedsCount).toEqual(4);

  ({ seedsCount, error } = getSeedsCount({
    policyDefinitions: SEEDING_USTA,
    participantCount: 15,
    drawSize: 128,
  }));
  expect(seedsCount).toEqual(4);

  ({ seedsCount, error } = getSeedsCount({
    policyDefinitions: SEEDING_USTA,
    participantCount: 64,
    drawSize: 128,
  }));
  expect(seedsCount).toEqual(16);

  ({ seedsCount, error } = getSeedsCount({
    policyDefinitions: SEEDING_USTA,
    participantCount: 65,
    drawSize: 128,
  }));
  expect(seedsCount).toEqual(16);

  ({ seedsCount, error } = getSeedsCount({
    policyDefinitions: SEEDING_USTA,
    participantCount: 97,
    drawSize: 128,
  }));
  expect(seedsCount).toEqual(32);

  ({ seedsCount, error } = getSeedsCount({
    policyDefinitions: SEEDING_USTA,
    drawSizeProgression: true,
    participantCount: 16,
    drawSize: 128,
  }));
  expect(seedsCount).toEqual(4);
});
