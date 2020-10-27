import { eventConstants } from '../../..';
import { avoidanceTest } from '../primitives/avoidanceTest';

import { PAIR } from '../../../constants/participantTypes';
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
