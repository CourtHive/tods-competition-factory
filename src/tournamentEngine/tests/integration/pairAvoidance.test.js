import { eventConstants } from '../../..';
import { intersection } from '../../../utilities/arrays';
import { avoidanceTest } from '../primitives/avoidanceTest';

import { PAIR } from '../../../constants/participantTypes';
const { SINGLES } = eventConstants;

const pairAvoidancePolicy = {
  roundsToSeparate: undefined,
  policyName: 'Doubles Partner Avoidance',
  policyAttributes: [{ directive: 'pairParticipants' }],
  // candidatesCount: 1, // force generation of only one candidate for logging during testing
};

it('can generate ELIMINATION drawDefinition using pair avoidance with Doubles participants', () => {
  const result = avoidanceTest({
    eventType: SINGLES,
    participantType: PAIR,
    participantsCount: 16,
    avoidance: pairAvoidancePolicy,
  });
  const { conflicts, report, participants } = result || {};
  const pairedParticipants = participants
    .filter(p => p.participantType === PAIR)
    .map(p => p.individualParticipants.map(ip => ip.name));
  const pairedOpponents = report.map(r => r.names);
  pairedParticipants.forEach(pair => {
    pairedOpponents.forEach(opponents => {
      const overlap = intersection(pair, opponents);
      expect(overlap.length).toBeLessThan(2);
    });
  });
  if (conflicts?.unseededConflicts) console.log(conflicts);
});

it('can generate ELIMINATION drawDefinition using pair avoidance with Doubles participants and seeding', () => {
  const result = avoidanceTest({
    seedsCount: 4,
    eventType: SINGLES,
    participantType: PAIR,
    participantsCount: 16,
    avoidance: pairAvoidancePolicy,
  });
  const { conflicts, report, participants } = result || {};
  const pairedParticipants = participants
    .filter(p => p.participantType === PAIR)
    .map(p => p.individualParticipants.map(ip => ip.name));
  const pairedOpponents = report.map(r => r.names);
  pairedParticipants.forEach(pair => {
    pairedOpponents.forEach(opponents => {
      const overlap = intersection(pair, opponents);
      if (overlap.length > 1) console.log({ pair, opponents, overlap });
    });
  });
  if (conflicts?.unseededConflicts) console.log(conflicts);
});

it('can generate ELIMINATION drawDefinition using pair and nationality avoidance with Doubles participants and seeding', () => {
  const pairAvoidancePolicy = {
    roundsToSeparate: undefined,
    policyName: 'Doubles Partner Avoidance',
    policyAttributes: [
      { key: 'person.nationalityCode' },
      { key: 'individualParticipants.person.nationalityCode' },
      { directive: 'pairParticipants' },
    ],
  };

  const result = avoidanceTest({
    seedsCount: 4,
    eventType: SINGLES,
    participantType: PAIR,
    participantsCount: 16,
    avoidance: pairAvoidancePolicy,
  });
  const { conflicts, report, participants } = result || {};
  const pairedParticipants = participants
    .filter(p => p.participantType === PAIR)
    .map(p => p.individualParticipants.map(ip => ip.name));
  const pairedOpponents = report.map(r => r.names);
  pairedParticipants.forEach(pair => {
    pairedOpponents.forEach(opponents => {
      const overlap = intersection(pair, opponents);
      if (overlap.length > 1) console.log({ pair, opponents, overlap });
    });
  });
  if (conflicts?.unseededConflicts) console.log(conflicts);
});
