import SEEDING_USTA from '../../../fixtures/seeding/SEEDING_USTA';
import { getSeedsCount } from '../../governors/policyGovernor/getSeedsCount';

it('can accurately determine seedsCount from drawSize and participantCount', () => {
  let seedsCount, error;
  ({ seedsCount, error } = getSeedsCount());
  expect(seedsCount).toEqual(undefined);
  expect(error).toEqual('Missing policyDefinition');

  ({ seedsCount, error } = getSeedsCount({ policyDefinition: SEEDING_USTA }));
  expect(seedsCount).toEqual(undefined);
  expect(error).toEqual('Missing participantCount');

  ({ seedsCount, error } = getSeedsCount({
    policyDefinition: SEEDING_USTA,
    participantCount: 15,
  }));
  expect(seedsCount).toEqual(undefined);
  expect(error).toEqual('Missing drawSize');

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
