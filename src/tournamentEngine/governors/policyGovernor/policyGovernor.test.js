import { tournamentEngine } from '../..';
import { getAppliedPolicies } from './getAppliedPolicies';

import AVOIDANCE_COUNTRY from '../../../fixtures/avoidance/AVOIDANCE_COUNTRY';
import { SUCCESS } from '../../../constants/resultConstants';
import { SINGLES } from '../../../constants/eventConstants';

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
  expect(result).toMatchObject({ error: 'Missing tournamentRecord' });

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
});
