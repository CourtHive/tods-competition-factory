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
  let { conflicts, error } = avoidanceTest({
    avoidance: avoidancePolicy,
    participantType: PAIR,
    eventType: DOUBLES,
    sex: 'M',
  });
  if (error) console.log({ error });
  if (conflicts?.unseededConflicts) {
    console.log(conflicts);
  }

  ({ conflicts, error } = avoidanceTest({
    avoidance: avoidancePolicy,
    participantType: PAIR,
    eventType: DOUBLES,
    sex: 'F',
  }));
  if (error) console.log({ error });
  if (conflicts?.unseededConflicts) {
    console.log(conflicts.unseededConflicts);
  }
});

it('can generate ELIMINATION drawDefinition using country avoidance with INDIVIDUAL participants', () => {
  let { conflicts, error } = avoidanceTest({
    eventType: SINGLES,
    participantType: INDIVIDUAL,
    avoidance: avoidancePolicy,
  });
  if (error) console.log({ error });
  if (conflicts?.unseededConflicts) console.log(conflicts.unseededConflicts);

  ({ conflicts, error } = avoidanceTest({
    eventType: SINGLES,
    participantType: INDIVIDUAL,
    avoidance: avoidancePolicy,
    valuesCount: 4,
  }));
  if (error) console.log({ error });
  if (conflicts?.unseededConflicts) console.log(conflicts.unseededConflicts);
});

it('can generate ELIMINATION drawDefinition using country avoidance with INDIVIDUAL participants and BYEs', () => {
  let { conflicts, error } = avoidanceTest({
    eventType: SINGLES,
    participantsCount: 17,
    participantType: INDIVIDUAL,
    avoidance: avoidancePolicy,
  });
  if (error) console.log({ error });
  if (conflicts?.unseededConflicts) console.log(conflicts.unseededConflicts);

  ({ conflicts, error } = avoidanceTest({
    eventType: SINGLES,
    participantsCount: 17,
    participantType: INDIVIDUAL,
    avoidance: avoidancePolicy,
    valuesCount: 4,
  }));
  if (error) console.log({ error });
  if (conflicts?.unseededConflicts) console.log(conflicts.unseededConflicts);

  ({ conflicts, error } = avoidanceTest({
    eventType: SINGLES,
    participantsCount: 23,
    participantType: INDIVIDUAL,
    avoidance: avoidancePolicy,
    valuesCount: 4,
  }));
  if (error) console.log({ error });
  if (conflicts?.unseededConflicts) console.log(conflicts.unseededConflicts);

  ({ conflicts, error } = avoidanceTest({
    eventType: SINGLES,
    participantsCount: 27,
    participantType: INDIVIDUAL,
    avoidance: avoidancePolicy,
    valuesCount: 4,
  }));
  if (error) console.log({ error });
  if (conflicts?.unseededConflicts) console.log(conflicts.unseededConflicts);

  ({ conflicts, error } = avoidanceTest({
    eventType: SINGLES,
    participantsCount: 17,
    participantType: INDIVIDUAL,
    avoidance: avoidancePolicy,
    valuesCount: 4,
  }));
  if (error) console.log({ error });
  if (conflicts?.unseededConflicts) console.log(conflicts.unseededConflicts);
});

it('can generate ROUND_ROBIN drawDefinition using country avoidance with INDIVIDUAL participants', () => {
  const { conflicts, error } = avoidanceTest({
    eventType: SINGLES,
    drawType: ROUND_ROBIN,
    participantType: INDIVIDUAL,
    avoidance: avoidancePolicy,
    participantsCount: 8,

    valuesInstanceLimit: 4,
    valuesCount: 8,
  });
  if (error) console.log({ error });
  if (conflicts?.unseededConflicts)
    console.log('RR conflicts:', conflicts?.unseededConflicts);
});
