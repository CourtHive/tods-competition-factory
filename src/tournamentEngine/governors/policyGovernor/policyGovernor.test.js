import { tournamentEngine } from '../..';
import { getAppliedPolicies } from './getAppliedPolicies';

import AVOIDANCE_COUNTRY from '../../../fixtures/avoidance/AVOIDANCE_COUNTRY';
import { SUCCESS } from '../../../constants/resultConstants';
import { SINGLES } from '../../../constants/eventConstants';
import { POLICY_TYPE_AVOIDANCE } from '../../../constants/policyConstants';
import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';

it('can set and reset policy governor', () => {
  expect(tournamentEngine).toHaveProperty('attachPolicy');

  // cannot attach a policy if no tournamentRecord
  tournamentEngine.reset();
  const scoringPolicy = {
    scoring: {
      policyName: 'TEST',
      allowedMatchUpFormats: ['SET3-S:6/TB7'],
    },
  };
  let result = tournamentEngine.attachPolicy({
    policyDefinition: scoringPolicy,
  });
  expect(result).toMatchObject({ error: MISSING_TOURNAMENT_RECORD });

  const newTournamentRecord = tournamentEngine.newTournamentRecord();
  const errors = tournamentEngine.getErrors();
  expect(errors).toMatchObject([]);

  tournamentEngine.setState(newTournamentRecord);
  result = tournamentEngine.attachPolicy({
    policyDefinition: scoringPolicy,
  });
  expect(result).toEqual(SUCCESS);

  const { tournamentRecord } = tournamentEngine.getState();
  const { appliedPolicies } = getAppliedPolicies({ tournamentRecord });
  expect(appliedPolicies.scoring.policyName).toEqual('TEST');

  const allowedMatchUpFormats = tournamentEngine.allowedMatchUpFormats();
  expect(allowedMatchUpFormats.length).toEqual(1);
  expect(allowedMatchUpFormats[0]).toEqual(
    scoringPolicy.scoring.allowedMatchUpFormats[0]
  );

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

  const {
    appliedPolicies: updatedAppliedPolicies,
  } = tournamentEngine.getEventAppliedPolicies({
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
