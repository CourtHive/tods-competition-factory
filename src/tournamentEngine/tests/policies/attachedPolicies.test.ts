import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../../examples/syncEngine';
import { expect, it, test } from 'vitest';

import POLICY_SEEDING_BYES from '../../../fixtures/policies/POLICY_SEEDING_BYES';
import { AD_HOC, WIN_RATIO } from '../../../constants/drawDefinitionConstants';
import POLICY_SEEDING_ITF from '../../../fixtures/policies/POLICY_SEEDING_ITF';
import ROUND_NAMING_POLICY from '../publishing/roundNamingPolicy';
import {
  APPLIED_POLICIES,
  ENTRY_PROFILE,
  FLIGHT_PROFILE,
} from '../../../constants/extensionConstants';
import {
  POLICY_TYPE_ROUND_NAMING,
  POLICY_TYPE_SEEDING,
} from '../../../constants/policyConstants';

it('generateDrawDefinition will find seeding policy attached to tournamentRecord', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    policyDefinitions: { ...ROUND_NAMING_POLICY, ...POLICY_SEEDING_ITF },
    drawProfiles: [{ drawSize: 32, drawType: AD_HOC }],
  });

  tournamentEngine.setState(tournamentRecord);
  const extensionNames = tournamentRecord.extensions.map(({ name }) => name);
  expect(extensionNames.includes(APPLIED_POLICIES)).toEqual(true);
  const appliedPolicies = tournamentRecord.extensions.find(
    ({ name }) => name === APPLIED_POLICIES
  );
  expect(Object.keys(appliedPolicies.value).length).toEqual(2);

  expect(
    tournamentRecord.extensions[0].value[POLICY_TYPE_ROUND_NAMING]
  ).not.toBeUndefined();

  expect(
    tournamentRecord.extensions[0].value[POLICY_TYPE_SEEDING]
  ).not.toBeUndefined();

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.structures.length).toEqual(1);
  expect(drawDefinition.structures[0].finishingPosition).toEqual(WIN_RATIO);

  // There is no POLICY_TYPE_SEEDING on the drawDefinition because it is attached to the tournamentRecord
  expect(drawDefinition.extensions.length).toEqual(2);
  expect(drawDefinition.extensions[1].name).toEqual(ENTRY_PROFILE);
});

it('generateDrawDefinition will find seeding policy attached to event', () => {
  const eventProfiles = [
    {
      eventName: 'Event Flights Test',
      policyDefinitions: { ...ROUND_NAMING_POLICY, ...POLICY_SEEDING_ITF },
      category: {
        categoryName: 'U12',
      },
      drawProfiles: [
        {
          drawSize: 32,
          qualifyingPositions: 4,
          drawName: 'Main Draw',
        },
      ],
    },
  ];
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({ eventProfiles });

  tournamentEngine.setState(tournamentRecord);
  expect(tournamentRecord.extensions).toBeUndefined();

  const { drawDefinition, event } = tournamentEngine.getEvent({ drawId });
  expect(event.extensions.length).toEqual(2);
  expect(event.extensions.map(({ name }) => name).sort()).toEqual([
    APPLIED_POLICIES,
    FLIGHT_PROFILE,
  ]);

  const appliedPolicies = event.extensions.find(
    ({ name }) => name === APPLIED_POLICIES
  );
  expect(Object.keys(appliedPolicies.value).length).toEqual(2);

  // There is no POLICY_TYPE_SEEDING on the drawDefinition appliedPolicies because it is attached to the tournamentRecord
  expect(drawDefinition.extensions.length).toEqual(2);
  expect(drawDefinition.extensions[1].name).toEqual(ENTRY_PROFILE);
});

it('policyDefinitions can be passed directly into generateDrawDefintion from drawProfiles', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        policyDefinitions: { ...ROUND_NAMING_POLICY, ...POLICY_SEEDING_ITF },
        drawSize: 32,
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);
  expect(tournamentRecord.extensions).toBeUndefined();

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });

  // There is no POLICY_TYPE_SEEDING on the drawDefinition attachedPolicies because it is attached to the tournamentRecord
  expect(drawDefinition.extensions.length).toEqual(2);
  expect(drawDefinition.extensions.map(({ name }) => name).sort()).toEqual([
    APPLIED_POLICIES,
    ENTRY_PROFILE,
  ]);

  const appliedPolicies = drawDefinition.extensions.find(
    ({ name }) => name === APPLIED_POLICIES
  );
  expect(Object.keys(appliedPolicies.value).length).toEqual(2);
});

test('seeding policies attached to tournamentRecords will be used when generating Draws', () => {
  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 16, generate: false }],
  });

  tournamentEngine.setState(tournamentRecord);

  tournamentEngine.attachPolicies({ policyDefinitions: POLICY_SEEDING_BYES });

  const {
    flightProfile: {
      flights: [flight],
    },
  } = tournamentEngine.getFlightProfile({ eventId });

  const { drawDefinition } = tournamentEngine.generateDrawDefinition({
    ...flight,
    eventId,
  });

  // there are no 'appliedPolicies' because seeding was found on the policies attached to the tournament
  expect(drawDefinition.extensions.map(({ name }) => name)).toEqual([
    'appliedPolicies',
    'entryProfile',
  ]);
});
