import { tournamentEngine } from '../..';
import { getAppliedPolicies } from './getAppliedPolicies';

import { SUCCESS } from '../../../constants/resultConstants';

it('can set and reset policy governor', () => {
  expect(tournamentEngine).toHaveProperty('attachPolicy');

  // cannot attach a policy if no tournamentRecord
  tournamentEngine.reset();
  const scoringPolicy = {
    scoring: {
      policyName: 'TEST',
      allowedScoringFormats: ['SET3-S:6/TB7'],
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
});
