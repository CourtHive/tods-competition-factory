import { getAppliedPolicies } from './getAppliedPolicies';
import { tournamentEngine } from '../../sync';

import AVOIDANCE_COUNTRY from '../../../fixtures/policies/POLICY_AVOIDANCE_COUNTRY';
import { SUCCESS } from '../../../constants/resultConstants';
import { SINGLES } from '../../../constants/eventConstants';
import {
  EXISTING_POLICY_TYPE,
  MISSING_EVENT,
  MISSING_POLICY_DEFINITION,
  MISSING_TOURNAMENT_RECORD,
  POLICY_NOT_ATTACHED,
  POLICY_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import {
  POLICY_TYPE_AVOIDANCE,
  POLICY_TYPE_SCORING,
} from '../../../constants/policyConstants';
import POLICY_SCORING_DEFAULT from '../../../fixtures/policies/POLICY_SCORING_DEFAULT';

it('can set and remove policies from tournamentRecords and events', () => {
  expect(tournamentEngine).toHaveProperty('attachPolicies');

  // cannot attach a policy if no tournamentRecord
  tournamentEngine.reset();
  const scoringPolicy = {
    [POLICY_TYPE_SCORING]: {
      policyName: 'TEST',
    },
  };
  let result = tournamentEngine.attachPolicies({
    policyDefinitions: scoringPolicy,
  });
  expect(result).toMatchObject({ error: MISSING_TOURNAMENT_RECORD });

  const newTournamentRecord = tournamentEngine.newTournamentRecord();

  tournamentEngine.setState(newTournamentRecord);
  result = tournamentEngine.attachPolicies();

  expect(result.error).toEqual(MISSING_POLICY_DEFINITION);
  result = tournamentEngine.attachPolicies({
    policyDefinitions: scoringPolicy,
    allowReplacement: true,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.attachPolicies({
    policyDefinitions: scoringPolicy,
  });
  expect(result.error).toEqual(EXISTING_POLICY_TYPE);

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

  result = tournamentEngine.attachEventPolicies({
    eventId,
  });
  expect(result.error).toEqual(MISSING_POLICY_DEFINITION);

  result = tournamentEngine.attachEventPolicies({
    policyDefinitions: {},
    eventId,
  });
  expect(result.error).toEqual(POLICY_NOT_ATTACHED);

  result = tournamentEngine.attachEventPolicies({
    eventId,
    policyDefinitions: AVOIDANCE_COUNTRY,
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

  result = tournamentEngine.attachEventPolicies({
    eventId,
    policyDefinitions: AVOIDANCE_COUNTRY,
  });
  expect(result).toEqual(SUCCESS);

  const { tournamentRecord: updatedRecord2 } = tournamentEngine.getState();
  expect(updatedRecord2.events.length).toEqual(1);
  expect(updatedRecord2.events[0].extensions.length).toEqual(1);

  const eventState = updatedRecord2.events[0];

  result = tournamentEngine.removeEventPolicy({
    policyType: POLICY_TYPE_AVOIDANCE,
  });
  expect(result.error).toEqual(MISSING_EVENT);

  result = tournamentEngine.removeEventPolicy({
    eventId: eventState.eventId,
    policyType: 'Foobar',
  });
  expect(result.error).toEqual(POLICY_NOT_FOUND);

  result = tournamentEngine.removeEventPolicy({
    eventId: eventState.eventId,
    policyType: POLICY_TYPE_AVOIDANCE,
  });
  expect(result).toEqual(SUCCESS);

  const { tournamentRecord: updatedRecord3 } = tournamentEngine.getState();
  expect(updatedRecord3.events.length).toEqual(1);
  expect(updatedRecord3.events[0].extensions.length).toEqual(0);

  result = tournamentEngine.attachEventPolicies({
    eventId,
    policyDefinitions: { ...AVOIDANCE_COUNTRY, ...POLICY_SCORING_DEFAULT },
  });
  expect(result).toEqual(SUCCESS);

  result = tournamentEngine.removeEventPolicy({
    eventId: eventState.eventId,
    policyType: POLICY_TYPE_AVOIDANCE,
  });
  expect(result).toEqual(SUCCESS);

  const { tournamentRecord: updatedRecord4 } = tournamentEngine.getState();
  expect(updatedRecord4.events.length).toEqual(1);
  expect(updatedRecord4.events[0].extensions.length).toEqual(1);
});

it('can find policies whether on event or tournamentRecord', () => {
  const newTournamentRecord = tournamentEngine.newTournamentRecord();
  tournamentEngine.setState(newTournamentRecord);

  const { error } = tournamentEngine.findPolicy({
    policyType: POLICY_TYPE_SCORING,
  });
  expect(error).toEqual(POLICY_NOT_FOUND);

  const testPolicyName = 'TEST';
  const scoringPolicy = {
    [POLICY_TYPE_SCORING]: {
      policyName: testPolicyName,
    },
  };
  let result = tournamentEngine.attachPolicies({
    policyDefinitions: scoringPolicy,
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

  result = tournamentEngine.attachEventPolicies({
    eventId,
    policyDefinitions: AVOIDANCE_COUNTRY,
  });
  expect(result.success).toEqual(true);

  const { tournamentRecord: updatedRecord } = tournamentEngine.getState();
  expect(updatedRecord.events.length).toEqual(1);
  expect(updatedRecord.events[0].extensions.length).toEqual(1);

  ({ policy } = tournamentEngine.findPolicy({
    policyType: POLICY_TYPE_SCORING,
  }));
  expect(policy.policyName).toEqual(testPolicyName);
  result = tournamentEngine.getAllowedMatchUpFormats({
    categoryName: undefined,
    categoryType: undefined,
  });
  expect(result).toEqual([]);

  ({ policy } = tournamentEngine.findPolicy({
    policyType: POLICY_TYPE_AVOIDANCE,
  }));
  expect(result.policy).toBeUndefined();

  ({ policy } = tournamentEngine.findPolicy({
    eventId,
    policyType: POLICY_TYPE_AVOIDANCE,
  }));
  expect(policy.policyName).toEqual('Nationality Code');

  result = tournamentEngine.attachEventPolicies({
    eventId,
    policyDefinitions: scoringPolicy,
  });
  expect(result).toEqual(SUCCESS);
});
