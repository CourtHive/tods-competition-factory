import { avoidanceTest } from '../primitives/avoidanceTest';
import { eventConstants } from '../../..';

import { INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
import { ROUND_ROBIN } from '../../../constants/drawDefinitionConstants';
const { SINGLES, DOUBLES } = eventConstants;

const avoidancePolicy = {
  roundsToSeparate: undefined,
  policyName: 'Nationality Code',
  policyAttributes: [
    { key: 'person.nationalityCode' },
    { key: 'individualParticipants.person.nationalityCode' },
  ],
};

it('can generate ELIMINATION drawDefinition using country avoidance with PAIR participants', () => {
  let { conflicts } = avoidanceTest({
    avoidance: avoidancePolicy,
    participantType: PAIR,
    eventType: DOUBLES,
    sex: 'M',
  });
  if (conflicts?.unseededConflicts) console.log(conflicts);

  ({ conflicts } = avoidanceTest({
    avoidance: avoidancePolicy,
    participantType: PAIR,
    eventType: DOUBLES,
    sex: 'F',
  }));
  if (conflicts?.unseededConflicts) console.log(conflicts.unseededConflicts);
});

it('can generate ELIMINATION drawDefinition using country avoidance with INDIVIDUAL participants', () => {
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
  if (conflicts?.unseededConflicts) console.log(conflicts.unseededConflicts);
});

it('can generate ROUND ROBIN drawDefinition using country avoidance with INDIVIDUAL participants', () => {
  const { conflicts } = avoidanceTest({
    eventType: SINGLES,
    drawType: ROUND_ROBIN,
    participantType: INDIVIDUAL,
    avoidance: avoidancePolicy,
    participantsCount: 8,

    valuesInstanceLimit: 4,
    valuesCount: 8,
  });
  if (conflicts?.unseededConflicts)
    console.log('RR conflicts:', conflicts?.unseededConflicts);
});
