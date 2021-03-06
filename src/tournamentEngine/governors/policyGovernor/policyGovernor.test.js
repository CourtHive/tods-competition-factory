import { tournamentEngine } from '../../sync';
import { getAppliedPolicies } from './getAppliedPolicies';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import AVOIDANCE_COUNTRY from '../../../fixtures/policies/POLICY_AVOIDANCE_COUNTRY';
import { SUCCESS } from '../../../constants/resultConstants';
import { SINGLES } from '../../../constants/eventConstants';
import {
  POLICY_TYPE_AVOIDANCE,
  POLICY_TYPE_SCORING,
} from '../../../constants/policyConstants';

it('can set and remove policies from tournamentRecords and events', () => {
  expect(tournamentEngine).toHaveProperty('attachPolicy');

  // cannot attach a policy if no tournamentRecord
  tournamentEngine.reset();
  const scoringPolicy = {
    [POLICY_TYPE_SCORING]: {
      policyName: 'TEST',
    },
  };
  let result = tournamentEngine.attachPolicy({
    policyDefinition: scoringPolicy,
  });
  expect(result).toMatchObject({ error: MISSING_TOURNAMENT_RECORD });

  const newTournamentRecord = tournamentEngine.newTournamentRecord();

  tournamentEngine.setState(newTournamentRecord);
  result = tournamentEngine.attachPolicy({
    policyDefinition: scoringPolicy,
    allowReplacement: true,
  });
  expect(result.success).toEqual(true);

  const { tournamentRecord } = tournamentEngine.getState();
  const { appliedPolicies } = getAppliedPolicies({ tournamentRecord });
  expect(appliedPolicies.scoring.policyName).toEqual('TEST');

  // test adding event policies
  const event = {
    eventName: 'Test Event',
    eventType: SINGLES,
  };

  result = tournamentEngine.addEvent({ event });
  const { event: eventResult, success } = result;
  const { eventId } = eventResult;
  expect(success).toEqual(true);

  result = tournamentEngine.attachEventPolicy({
    eventId,
    policyDefinition: AVOIDANCE_COUNTRY,
  });
  expect(result).toEqual(SUCCESS);

  const { tournamentRecord: updatedRecord } = tournamentEngine.getState();
  expect(updatedRecord.events.length).toEqual(1);
  expect(updatedRecord.events[0].extensions.length).toEqual(1);

  const { appliedPolicies: updatedAppliedPolicies } =
    tournamentEngine.getEventAppliedPolicies({
      eventId,
    });
  expect(updatedAppliedPolicies.avoidance.policyName).toEqual(
    'Nationality Code'
  );

  result = tournamentEngine.attachEventPolicy({
    eventId,
    policyDefinition: AVOIDANCE_COUNTRY,
  });
  expect(result).toEqual(SUCCESS);

  const { tournamentRecord: updatedRecord2 } = tournamentEngine.getState();
  expect(updatedRecord2.events.length).toEqual(1);
  expect(updatedRecord2.events[0].extensions.length).toEqual(1);

  const eventState = updatedRecord2.events[0];

  result = tournamentEngine.removeEventPolicy({
    eventId: eventState.eventId,
    policyType: POLICY_TYPE_AVOIDANCE,
  });
  expect(result).toEqual(SUCCESS);

  const { tournamentRecord: updatedRecord3 } = tournamentEngine.getState();
  expect(updatedRecord3.events.length).toEqual(1);
  expect(updatedRecord3.events[0].extensions.length).toEqual(0);
});

it('can find policies whether on event or tournamentRecord', () => {
  const newTournamentRecord = tournamentEngine.newTournamentRecord();
  tournamentEngine.setState(newTournamentRecord);

  const testPolicyName = 'TEST';
  const scoringPolicy = {
    [POLICY_TYPE_SCORING]: {
      policyName: testPolicyName,
    },
  };
  let result = tournamentEngine.attachPolicy({
    policyDefinition: scoringPolicy,
  });
  expect(result.success).toEqual(true);

  let { policy } = tournamentEngine.findPolicy({
    policyType: POLICY_TYPE_SCORING,
  });
  expect(policy.policyName).toEqual(testPolicyName);

  const event = {
    eventName: 'Test Event',
    eventType: SINGLES,
  };

  result = tournamentEngine.addEvent({ event });
  const { event: eventResult } = result;
  const { eventId } = eventResult;
  expect(result.success).toEqual(true);

  // expect to find the policy attached to the tournament even when passing eventId
  ({ policy } = tournamentEngine.findPolicy({
    eventId,
    policyType: POLICY_TYPE_SCORING,
  }));
  expect(policy.policyName).toEqual(testPolicyName);

  result = tournamentEngine.attachEventPolicy({
    eventId,
    policyDefinition: AVOIDANCE_COUNTRY,
  });
  expect(result.success).toEqual(true);

  const { tournamentRecord: updatedRecord } = tournamentEngine.getState();
  expect(updatedRecord.events.length).toEqual(1);
  expect(updatedRecord.events[0].extensions.length).toEqual(1);

  ({ policy } = tournamentEngine.findPolicy({
    policyType: POLICY_TYPE_SCORING,
  }));
  expect(policy.policyName).toEqual(testPolicyName);

  ({ policy } = tournamentEngine.findPolicy({
    policyType: POLICY_TYPE_AVOIDANCE,
  }));
  expect(result.policy).toBeUndefined();

  ({ policy } = tournamentEngine.findPolicy({
    eventId,
    policyType: POLICY_TYPE_AVOIDANCE,
  }));
  expect(policy.policyName).toEqual('Nationality Code');

  result = tournamentEngine.attachEventPolicy({
    eventId,
    policyDefinition: scoringPolicy,
  });
  expect(result).toEqual(SUCCESS);
});
