import { getSeedsCount } from '../../governors/policyGovernor/getSeedsCount';
import {
  MISSING_PARTICIPANT_COUNT,
  MISSING_POLICY_DEFINITION,
} from '../../../constants/errorConditionConstants';
import SEEDING_USTA from '../../../fixtures/policies/POLICY_SEEDING_USTA';

it('can accurately determine seedsCount from drawSize and participantCount', () => {
  let seedsCount, error;
  ({ seedsCount, error } = getSeedsCount());
  expect(seedsCount).toEqual(undefined);
  expect(error).toEqual(MISSING_POLICY_DEFINITION);

  ({ seedsCount, error } = getSeedsCount({ policyDefinition: SEEDING_USTA }));
  expect(seedsCount).toEqual(undefined);
  expect(error).toEqual(MISSING_PARTICIPANT_COUNT);

  ({ seedsCount, error } = getSeedsCount({
    policyDefinition: SEEDING_USTA,
    participantCount: 15,
  }));
  expect(seedsCount).toEqual(4);

  ({ seedsCount, error } = getSeedsCount({
    policyDefinition: SEEDING_USTA,
    participantCount: 15,
    drawSize: 16,
  }));
  expect(seedsCount).toEqual(4);

  ({ seedsCount, error } = getSeedsCount({
    policyDefinition: SEEDING_USTA,
    participantCount: 15,
    drawSize: 128,
  }));
  expect(seedsCount).toEqual(0);

  ({ seedsCount, error } = getSeedsCount({
    policyDefinition: SEEDING_USTA,
    participantCount: 64,
    drawSize: 128,
  }));
  expect(seedsCount).toEqual(0);

  ({ seedsCount, error } = getSeedsCount({
    policyDefinition: SEEDING_USTA,
    participantCount: 65,
    drawSize: 128,
  }));
  expect(seedsCount).toEqual(16);

  ({ seedsCount, error } = getSeedsCount({
    policyDefinition: SEEDING_USTA,
    participantCount: 97,
    drawSize: 128,
  }));
  expect(seedsCount).toEqual(32);

  ({ seedsCount, error } = getSeedsCount({
    policyDefinition: SEEDING_USTA,
    drawSizeProgression: true,
    participantCount: 16,
    drawSize: 128,
  }));
  expect(seedsCount).toEqual(4);
});
