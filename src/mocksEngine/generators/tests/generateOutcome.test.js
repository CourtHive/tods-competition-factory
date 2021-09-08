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

const iterations = 1;

it.each(generateRange(0, iterations))(
  'can generate score strings for matchUpFormats',
  () => {
    let result = mocksEngine.generateOutcome({ matchUpFormat: '' });
    expect(result.error).toEqual(INVALID_MATCHUP_FORMAT);
    result = mocksEngine.generateOutcome({ matchUpStatusProfile: '' });
    expect(result.error).toEqual(INVALID_VALUES);
    result = mocksEngine.generateOutcome({ matchUpStatusProfile: {} });
    expect([1, 2].includes(result.outcome.winningSide)).toBeTruthy();
    expect(result.outcome.matchUpStatus).toEqual(COMPLETED);

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
  }
);

// used to validate sideWeight to limit generation of 3 sets
test.each(generateRange(0, iterations))('iteration counts', () => {
  // winningSides is used to verify even distribution
  const winningSides = { 1: 0, 2: 0 };

  let firstIteration3Sets = 0;
  generateRange(0, 100).forEach(() => {
    let { outcome } = mocksEngine.generateOutcome({ sideWeight: 1 });
    winningSides[outcome.winningSide] += 1;
    if (outcome.score.sets.length === 3) firstIteration3Sets += 1;
  });

  let secondIteration3Sets = 0;
  generateRange(0, 100).forEach(() => {
    let { outcome } = mocksEngine.generateOutcome({ sideWeight: 100 });
    winningSides[outcome.winningSide] += 1;
    if (outcome.score.sets.length === 3) secondIteration3Sets += 1;
  });

  expect(firstIteration3Sets).toBeGreaterThan(secondIteration3Sets);
});

test.each(generateRange(0, iterations))('supports timed matchUpFormats', () => {
  let result = mocksEngine.generateOutcome({
    matchUpFormat: 'SET1-S:T20',
    matchUpStatusProfile: {}, // ensures that there are no DOUBLE_WALKOVERS
  });
  expect(result.outcome.winningSide).not.toBeUndefined();

  // supports short form matchUpFormat for timed sets
  result = mocksEngine.generateOutcome({
    matchUpFormat: 'T20',
    matchUpStatusProfile: {}, // ensures that there are no DOUBLE_WALKOVERS
  });
  expect(result.outcome.winningSide).not.toBeUndefined();

  result = mocksEngine.generateOutcome({
    matchUpFormat: 'SET3-S:T20',
    matchUpStatusProfile: {}, // ensures that there are no DOUBLE_WALKOVERS
  });
  expect(result.outcome.winningSide).not.toBeUndefined();
  expect([2, 3].includes(result.outcome.score.sets.length)).toEqual(true);

  result = mocksEngine.generateOutcome({
    matchUpFormat: 'SET3-S:T20',
    matchUpStatusProfile: { [RETIRED]: 100 },
  });
  expect(result.outcome.winningSide).not.toBeUndefined();
  expect(result.outcome.matchUpStatus).toEqual(RETIRED);
});

test.each(generateRange(0, iterations))(
  'supports specifying winningSide',
  () => {
    let result;
    generateRange(0, 10).forEach(() => {
      result = mocksEngine.generateOutcome({
        matchUpFormat: 'SET1-S:T20',
        matchUpStatusProfile: {}, // ensures that there are no DOUBLE_WALKOVERS
        winningSide: 1,
      });
      expect(result.outcome.winningSide).toEqual(1);
      result = mocksEngine.generateOutcome({
        matchUpFormat: 'SET1-S:T20',
        matchUpStatusProfile: {}, // ensures that there are no DOUBLE_WALKOVERS
        winningSide: 2,
      });
      expect(result.outcome.winningSide).toEqual(2);

      result = mocksEngine.generateOutcome({
        matchUpStatusProfile: {}, // ensures that there are no DOUBLE_WALKOVERS
        winningSide: 1,
      });
      expect(result.outcome.winningSide).toEqual(1);

      result = mocksEngine.generateOutcome({
        matchUpStatusProfile: {}, // ensures that there are no DOUBLE_WALKOVERS
        winningSide: 2,
      });
      expect(result.outcome.winningSide).toEqual(2);

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
    });
  }
);

test.each(generateRange(0, iterations))('other matchUpFormats', () => {
  let result = mocksEngine.generateOutcome({
    matchUpFormat: 'SET3-S:4/TB7',
    matchUpStatusProfile: {}, // ensures a COMPLETED outcome
  });
  const { side1Score, side2Score } = result.outcome.score.sets[0];
  expect(Math.max(side1Score, side2Score) <= 5).toBeTruthy();

  result = mocksEngine.generateOutcome({
    matchUpFormat: 'SET3-S:TB7',
    matchUpStatusProfile: {},
    winningSide: 2,
  });
  expect(result.outcome.winningSide).toEqual(2);
  expect(result.outcome.matchUpStatus).toEqual(COMPLETED);
});
