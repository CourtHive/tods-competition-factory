import { avoidanceTest } from '../primitives/avoidanceTest';
import { intersection } from '../../../utilities/arrays';

import { PAIR } from '../../../constants/participantTypes';
import { eventConstants } from '../../..';
const { SINGLES } = eventConstants;

const pairAvoidancePolicy = {
  candidatesCount: 20,
  roundsToSeparate: undefined,
  policyName: 'Doubles Partner Avoidance',
  policyAttributes: [{ directive: 'pairParticipants' }],
};

it('can generate SINGLE_ELIMINATION drawDefinition using pair avoidance with Doubles participants', () => {
  const result = avoidanceTest({
    eventType: SINGLES,
    participantType: PAIR,
    participantsCount: 16,
    avoidance: pairAvoidancePolicy,
  });
  const { conflicts, report, participants } = result || {};
  const pairedParticipants = participants
    .filter((p) => p.participantType === PAIR)
    .map((p) => p.individualParticipants.map((ip) => ip.participantName));
  const pairedOpponents = report.map((r) => r.names);
  pairedParticipants.forEach((pair) => {
    pairedOpponents.forEach((opponents) => {
      const overlap = intersection(pair, opponents);
      expect(overlap.length).toBeLessThan(2);
    });
  });
  if (conflicts?.unseededConflicts) console.log(conflicts);
});

it('can generate SINGLE_ELIMINATION drawDefinition using pair avoidance with Doubles participants and seeding', () => {
  const result = avoidanceTest({
    seedsCount: 4,
    eventType: SINGLES,
    participantType: PAIR,
    participantsCount: 16,
    avoidance: pairAvoidancePolicy,
  });
  const { conflicts, report, participants } = result || {};
  const pairedParticipants = participants
    .filter((p) => p.participantType === PAIR)
    .map((p) => p.individualParticipants.map((ip) => ip.participantName));
  const pairedOpponents = report.map((r) => r.names);
  pairedParticipants.forEach((pair) => {
    pairedOpponents.forEach((opponents) => {
      const overlap = intersection(pair, opponents);
      if (overlap.length > 1) console.log({ pair, opponents, overlap });
    });
  });
  if (conflicts?.unseededConflicts) console.log(conflicts);
});

it('can generate SINGLE_ELIMINATION drawDefinition using pair and nationality avoidance with Doubles participants and seeding', () => {
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
    .filter((p) => p.participantType === PAIR)
    .map((p) => p.individualParticipants.map((ip) => ip.participantName));
  const pairedOpponents = report.map((r) => r.names);
  pairedParticipants.forEach((pair) => {
    pairedOpponents.forEach((opponents) => {
      const overlap = intersection(pair, opponents);
      if (overlap.length > 1) console.log({ pair, opponents, overlap });
    });
  });
  if (conflicts?.unseededConflicts) console.log(conflicts);
});
