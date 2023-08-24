import tournamentEngine from '../../../tournamentEngine/sync';
import mocksEngine from '../../../mocksEngine';
import { expect, it } from 'vitest';

import {
  INVALID_VALUES,
  MATCHUP_NOT_FOUND,
  MISSING_MATCHUP,
  MISSING_MATCHUP_ID,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

it('attached delegated outcomes to matchUps', () => {
  const drawSize = 8;
  const drawProfiles = [{ drawSize }];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  const {
    matchUps: [{ matchUpId }],
  } = tournamentEngine.setState(tournamentRecord).allDrawMatchUps({
    drawId,
  });

  const outcome = {
    score: {
      scoreStringSide1: '6-1 6-1',
      scoreStringSide2: '1-6 1-6',
    },
  };

  // first check all error messages
  let result = tournamentEngine.setDelegatedOutcome({
    outcome,
    drawId,
  });
  expect(result.error).toEqual(MISSING_MATCHUP);
  result = tournamentEngine.setDelegatedOutcome({
    matchUpId,
    drawId,
  });
  expect(result.error).toEqual(MISSING_VALUE);
  result = tournamentEngine.setDelegatedOutcome({
    outcome: 'outcome',
    matchUpId,
    drawId,
  });
  expect(result.error).toEqual(INVALID_VALUES);
  result = tournamentEngine.setDelegatedOutcome({
    outcome: {},
    matchUpId,
    drawId,
  });
  expect(result.error).toEqual(INVALID_VALUES);
  result = tournamentEngine.setDelegatedOutcome({
    outcome: { score: 'string' },
    matchUpId,
    drawId,
  });
  expect(result.error).toEqual(INVALID_VALUES);
  result = tournamentEngine.setDelegatedOutcome({
    outcome: { score: { scoreStringSide1: 'string' } },
    matchUpId,
    drawId,
  });
  expect(result.error).toEqual(INVALID_VALUES);
  result = tournamentEngine.setDelegatedOutcome({
    outcome: { score: { scoreStringSide2: 'string' } },
    matchUpId,
    drawId,
  });
  expect(result.error).toEqual(INVALID_VALUES);
  result = tournamentEngine.setDelegatedOutcome({
    matchUpId: 'bogusId',
    outcome,
    drawId,
  });
  expect(result.error).toEqual(MATCHUP_NOT_FOUND);

  // then set a delegated outcome
  result = tournamentEngine.setDelegatedOutcome({
    matchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  const {
    matchUps: [matchUp],
  } = tournamentEngine.allDrawMatchUps({
    inContext: true,
    drawId,
  });

  expect(matchUp._delegatedOutcome).toEqual(outcome);

  result = tournamentEngine.removeDelegatedOutcome({ drawId });
  expect(result.error).toEqual(MISSING_MATCHUP_ID);

  result = tournamentEngine.removeDelegatedOutcome({
    matchUpId: 'bogusId',
    drawId,
  });
  expect(result.error).toEqual(MATCHUP_NOT_FOUND);

  result = tournamentEngine.removeDelegatedOutcome({ drawId, matchUpId });
  expect(result.success).toEqual(true);

  // attempting to remove something already removed doesn't throw error
  result = tournamentEngine.removeDelegatedOutcome({ drawId, matchUpId });
  expect(result.success).toEqual(true);
});
