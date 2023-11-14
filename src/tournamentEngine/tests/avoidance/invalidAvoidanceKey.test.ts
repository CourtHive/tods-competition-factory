import { avoidanceTest } from '../primitives/avoidanceTest';
import { it } from 'vitest';

import { PAIR } from '../../../constants/participantConstants';
import { eventConstants } from '../../..';
const { DOUBLES } = eventConstants;

const avoidancePolicy = {
  roundsToSeparate: undefined,
  policyName: 'Bogus Policy',
  policyAttributes: [{ key: 'person.bogus.attribute' }],
};

it('will fail gracefully when passed invalid policyAttributes', () => {
  const result = avoidanceTest({
    eventType: DOUBLES,
    participantType: PAIR,
    avoidance: avoidancePolicy,
  });
  let { conflicts } = result || {};
  if (conflicts?.unseededConflicts) console.log(conflicts);

  ({ conflicts } = avoidanceTest({
    eventType: DOUBLES,
    participantType: PAIR,
    avoidance: avoidancePolicy,
    valuesCount: 5,
  }));
  if (conflicts?.unseededConflicts) console.log(conflicts.unseededConflicts);
});
