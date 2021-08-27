import { generateRange } from '../../../utilities';
import mocksEngine from '../..';

import { COMPLETED } from '../../../constants/matchUpStatusConstants';
import {
  INVALID_MATCHUP_FORMAT,
  INVALID_VALUES,
} from '../../../constants/errorConditionConstants';

it('can generate score strings for matchUpFormats', () => {
  let result = mocksEngine.generateOutcome({ matchUpFormat: '' });
  expect(result.error).toEqual(INVALID_MATCHUP_FORMAT);
  result = mocksEngine.generateOutcome({ matchUpStatusProfile: '' });
  expect(result.error).toEqual(INVALID_VALUES);
  result = mocksEngine.generateOutcome({ matchUpStatusProfile: {} });
  expect([1, 2].includes(result.outcome.winningSide)).toBeTruthy();
  expect(result.outcome.matchUpStatus).toEqual(COMPLETED);

  result = mocksEngine.generateOutcome({ winningSide: 1 });
  expect(result.outcome.winningSide).toEqual(1);
  result = mocksEngine.generateOutcome({ winningSide: 2 });
  expect(result.outcome.winningSide).toEqual(2);

  /*
  result = mocksEngine.generateOutcome();
  let { outcome } = result;
  console.log({
    score: outcome.score,
    sets: outcome.score?.sets,
    matchUpStatus: outcome.matchUpStatus,
    winningSide: outcome.winningSide,
  });
  */
});

// used to validate sideWeight to limit generation of 3 sets
test('iteration counts', () => {
  // winningSides was used to verify even distribution
  const winningSides = { 1: 0, 2: 0 };

  let threeSets = 0;

  generateRange(0, 10).forEach(() => {
    let { outcome } = mocksEngine.generateOutcome({ sideWeight: 1 });
    winningSides[outcome.winningSide] += 1;
    if (outcome.score.sets.length === 3) threeSets += 1;
  });

  const firstIteration = threeSets;

  threeSets = 0;
  generateRange(0, 10).forEach(() => {
    let { outcome } = mocksEngine.generateOutcome({ sideWeight: 100 });
    winningSides[outcome.winningSide] += 1;
    if (outcome.score.sets.length === 3) threeSets += 1;
  });

  expect(firstIteration).toBeGreaterThan(threeSets);
});
