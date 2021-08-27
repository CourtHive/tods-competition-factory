import { generateRange } from '../../../utilities';
import mocksEngine from '../..';

import {
  COMPLETED,
  DEFAULTED,
  DOUBLE_WALKOVER,
  INCOMPLETE,
  RETIRED,
  SUSPENDED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';
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

  result = mocksEngine.generateOutcome({
    matchUpStatusProfile: {}, // insures that there are no DOUBLE_WALKOVERS
    winningSide: 1,
  });
  expect(result.outcome.winningSide).toEqual(1);

  result = mocksEngine.generateOutcome({
    matchUpStatusProfile: { [WALKOVER]: 100 },
    winningSide: 1,
  });
  expect(result.outcome.winningSide).toEqual(1);

  result = mocksEngine.generateOutcome({
    matchUpStatusProfile: { [RETIRED]: 100 },
    winningSide: 1,
  });
  expect(result.outcome.winningSide).toEqual(1);

  result = mocksEngine.generateOutcome({
    matchUpStatusProfile: {}, // insures that there are no DOUBLE_WALKOVERS
    winningSide: 2,
  });
  expect(result.outcome.winningSide).toEqual(2);

  let { outcome } = mocksEngine.generateOutcome({
    matchUpStatusProfile: { [RETIRED]: 100 },
  });
  expect(outcome.matchUpStatus).toEqual(RETIRED);
  expect([1, 2].includes(outcome.winningSide)).toEqual(true);
  expect(outcome.score.sets.pop().winningSide).toBeUndefined();

  ({ outcome } = mocksEngine.generateOutcome({
    matchUpStatusProfile: { [DEFAULTED]: 100 },
  }));
  expect(outcome.matchUpStatus).toEqual(DEFAULTED);
  expect([1, 2].includes(outcome.winningSide)).toEqual(true);
  const defaultedSet = outcome.score.sets.pop();
  if (defaultedSet) {
    expect(defaultedSet.winningSide).toBeUndefined();
  }
  ({ outcome } = mocksEngine.generateOutcome({
    matchUpStatusProfile: { [DEFAULTED]: 100 },
    defaultWithScorePercent: 100,
  }));
  expect(outcome.matchUpStatus).toEqual(DEFAULTED);
  expect([1, 2].includes(outcome.winningSide)).toEqual(true);
  expect(outcome.score.sets.length).toBeGreaterThan(0);

  ({ outcome } = mocksEngine.generateOutcome({
    matchUpStatusProfile: { [WALKOVER]: 100 },
  }));
  expect(outcome.matchUpStatus).toEqual(WALKOVER);
  expect(outcome.score.sets).toEqual([]);
  expect(outcome.score.side1ScoreString).toEqual('');
  expect(outcome.score.side2ScoreString).toEqual('');
  expect([1, 2].includes(outcome.winningSide)).toEqual(true);

  ({ outcome } = mocksEngine.generateOutcome({
    matchUpStatusProfile: { [DOUBLE_WALKOVER]: 100 },
  }));
  expect(outcome.matchUpStatus).toEqual(DOUBLE_WALKOVER);
  expect(outcome.score.sets).toEqual([]);
  expect(outcome.score.side1ScoreString).toEqual('');
  expect(outcome.score.side2ScoreString).toEqual('');
  expect(outcome.winningSide).toBeUndefined();

  // specifying a winningSide does not produce a winningSide for DOUBLE_WALKOVER
  ({ outcome } = mocksEngine.generateOutcome({
    matchUpStatusProfile: { [DOUBLE_WALKOVER]: 100 },
    winningSide: 1,
  }));
  expect(outcome.matchUpStatus).toEqual(DOUBLE_WALKOVER);
  expect(outcome.winningSide).toBeUndefined();

  ({ outcome } = mocksEngine.generateOutcome({
    matchUpStatusProfile: { [SUSPENDED]: 100 },
    winningSide: 1,
  }));
  expect(outcome.matchUpStatus).toEqual(SUSPENDED);
  expect(outcome.winningSide).toBeUndefined();

  ({ outcome } = mocksEngine.generateOutcome({
    matchUpStatusProfile: { [INCOMPLETE]: 100 },
    winningSide: 1,
  }));
  expect(outcome.matchUpStatus).toEqual(INCOMPLETE);
  expect(outcome.winningSide).toBeUndefined();
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
