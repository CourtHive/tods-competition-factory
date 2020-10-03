import { eventConstants } from '../../..';
import { avoidanceTest } from '../primitives/avoidanceTest';

import { INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
const { SINGLES, DOUBLES } = eventConstants;

const avoidancePolicy = {
  roundsToSeparate: undefined,
  policyName: 'Nationality Code',
  policyAttributes: [
    'person.nationalityCode',
    'individualParticipants.person.nationalityCode',
  ],
};

it('can generate drawDefinition using country avoidance', () => {
  let { conflicts } = avoidanceTest({
    eventType: DOUBLES,
    participantType: PAIR,
    avoidance: avoidancePolicy,
  });
  if (conflicts?.unseededConflicts?.length) console.log(conflicts);

  ({ conflicts } = avoidanceTest({
    eventType: DOUBLES,
    participantType: PAIR,
    avoidance: avoidancePolicy,
    valuesCount: 5,
  }));
  if (conflicts?.unseededConflicts?.length)
    console.log(conflicts.unseededConflicts);
});

it('can generate drawDefinition for singles using country avoidance', () => {
  avoidanceTest({
    eventType: SINGLES,
    participantType: INDIVIDUAL,
    avoidance: avoidancePolicy,
  });

  const { conflicts } = avoidanceTest({
    eventType: SINGLES,
    participantType: INDIVIDUAL,
    avoidance: avoidancePolicy,
    valuesCount: 4,
  });
  if (conflicts?.unseededConflicts?.length)
    console.log(conflicts.unseededConflicts);
});
