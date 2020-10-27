import { eventConstants } from '../../..';
import { avoidanceTest } from '../primitives/avoidanceTest';

import { PAIR } from '../../../constants/participantTypes';
const { SINGLES } = eventConstants;

const pairAvoidancePolicy = {
  roundsToSeparate: undefined,
  policyName: 'Doubles Partner Avoidance',
  policyAttributes: [{ directive: 'pairParticipants' }],
};

it('can generate ELIMINATION drawDefinition using pair avoidance with Doubles participants', () => {
  const result = avoidanceTest({
    eventType: SINGLES,
    participantType: PAIR,
    avoidance: pairAvoidancePolicy,
  });
  const { conflicts } = result || {};
  if (conflicts?.unseededConflicts) console.log(conflicts);
});
