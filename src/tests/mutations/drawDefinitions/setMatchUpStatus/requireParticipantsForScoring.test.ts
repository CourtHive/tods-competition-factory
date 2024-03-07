import { mocksEngine } from '@Assemblies/engines/mock';
import tournamentEngine from '@Engines/syncEngine';
import { test, expect } from 'vitest';

// constants
import { POLICY_TYPE_SCORING } from '@Constants/policyConstants';
import { COMPLETED } from '@Constants/matchUpStatusConstants';

test('scoring policy can specify that participants are required for scoring', () => {
  const drawId = 'drawId';
  const policyDefinitions = {
    [POLICY_TYPE_SCORING]: {
      requireParticipantsForScoring: false,
    },
  };
  mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawId, idPrefix: 'm', drawSize: 2, automated: false }], // don't assign participants: { automated: false }
    policyDefinitions,
    setState: true,
  });

  const { outcome } = mocksEngine.generateOutcomeFromScoreString({
    matchUpStatus: COMPLETED,
    scoreString: '6-1 6-1',
    winningSide: 1,
  });
  const result = tournamentEngine.setMatchUpStatus({
    matchUpId: 'm-1-1',
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);
});
