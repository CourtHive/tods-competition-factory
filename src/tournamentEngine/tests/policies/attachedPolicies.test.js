import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { AD_HOC, WIN_RATIO } from '../../../constants/drawDefinitionConstants';
import POLICY_SEEDING_ITF from '../../../fixtures/policies/POLICY_SEEDING_ITF';
import { POLICY_TYPE_ROUND_NAMING } from '../../../constants/policyConstants';
import ROUND_NAMING_POLICY from '../publishing/roundNamingPolicy';
import {
  APPLIED_POLICIES,
  ENTRY_PROFILE,
  FLIGHT_PROFILE,
} from '../../../constants/extensionConstants';

it('generateDrawDefinition will find seeding policy attached to tournamentRecord', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32, drawType: AD_HOC }],
    policyDefinitions: { ...ROUND_NAMING_POLICY, ...POLICY_SEEDING_ITF },
  });

  tournamentEngine.setState(tournamentRecord);
  expect(tournamentRecord.extensions.length).toEqual(1);
  expect(tournamentRecord.extensions[0].name).toEqual(APPLIED_POLICIES);
  const appliedPolicies = tournamentRecord.extensions.find(
    ({ name }) => name === APPLIED_POLICIES
  );
  expect(Object.keys(appliedPolicies.value).length).toEqual(2);

  expect(
    tournamentRecord.extensions[0].value[POLICY_TYPE_ROUND_NAMING]
  ).not.toBeUndefined();

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.structures.length).toEqual(1);
  expect(drawDefinition.structures[0].finishingPosition).toEqual(WIN_RATIO);

  // There is no POLICY_TYPE_SEEDING on the drawDefinition because it is attached to the tournamentRecord
  expect(drawDefinition.extensions.length).toEqual(1);
  expect(drawDefinition.extensions[0].name).toEqual(ENTRY_PROFILE);
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

  // There is no POLICY_TYPE_SEEDING on the drawDefinition because it is attached to the tournamentRecord
  expect(drawDefinition.extensions.length).toEqual(1);
  expect(drawDefinition.extensions[0].name).toEqual(ENTRY_PROFILE);
});

it('policyDefinitions can be passed directly into generateDrawDefintion from drawProfiles', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        drawSize: 32,
        drawType: AD_HOC,
        policyDefinitions: { ...ROUND_NAMING_POLICY, ...POLICY_SEEDING_ITF },
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);
  expect(tournamentRecord.extensions).toBeUndefined();

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });

  // There is no POLICY_TYPE_SEEDING on the drawDefinition because it is attached to the tournamentRecord
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
