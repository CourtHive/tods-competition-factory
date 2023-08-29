import { stressTests } from './standardStress';
import { keyValueMatchUpScore } from '..';
import { expect, it } from 'vitest';

import { FORMAT_STANDARD } from '../../../../../fixtures/scoring/matchUpFormats';
import { TIEBREAK_CLOSER, scoreMatchUp, enterValues } from './primitives';

/*
  NOTE:
    TIEBREAK_CLOSER must be used instead of { value: ')' }
    ...because value passed into keyValueMatchUpScore from HotDiv is { lowSide: 2, value: '0' }
*/

stressTests({ matchUpFormat: FORMAT_STANDARD, setTo: 6 });

it('can enter a straight set win for side 1', () => {
  const matchUpFormat = FORMAT_STANDARD;
  let matchUp: any = { scoreString: undefined, sets: [], matchUpFormat };

  ({ matchUp } = keyValueMatchUpScore({
    lowSide: 2,
    value: 3,
    matchUp,
    matchUpFormat,
  }));

  expect(matchUp?.scoreString.trim()).toEqual('6-3');
  expect(matchUp?.sets).toMatchObject([
    { side1Score: 6, side2Score: 3, winningSide: 1 },
  ]);
  expect(matchUp?.sets[0].winningSide).toEqual(1);

  ({ matchUp } = keyValueMatchUpScore({
    lowSide: 2,
    value: 2,
    matchUp,
    matchUpFormat,
  }));
  expect(matchUp?.scoreString.trim()).toEqual('6-3 6-2');
  expect(matchUp?.sets.length).toEqual(2);
  expect(matchUp?.sets[1].winningSide).toEqual(1);
  expect(matchUp?.winningSide).toEqual(1);

  // entering a value after winningSide is determined does nothing
  const { info, updated } = keyValueMatchUpScore({
    lowSide: 2,
    value: 2,
    matchUp,
    matchUpFormat,
  });
  expect(updated).toEqual(false);
  expect(info).toEqual('matchUp is complete');
});

it('can enter a straight set win for side 2', () => {
  const matchUpFormat = FORMAT_STANDARD;
  let matchUp: any = { scoreString: undefined, sets: [], matchUpFormat };

  ({ matchUp } = keyValueMatchUpScore({
    lowSide: 1,
    value: 3,
    matchUp,
    matchUpFormat,
  }));

  expect(matchUp?.scoreString.trim()).toEqual('3-6');
  expect(matchUp?.sets).toMatchObject([
    { side1Score: 3, side2Score: 6, winningSide: 2 },
  ]);
  expect(matchUp?.sets[0].winningSide).toEqual(2);

  ({ matchUp } = keyValueMatchUpScore({
    lowSide: 1,
    value: 2,
    matchUp,
    matchUpFormat,
  }));
  expect(matchUp?.scoreString.trim()).toEqual('3-6 2-6');
  expect(matchUp?.sets.length).toEqual(2);
  expect(matchUp?.sets[1].winningSide).toEqual(2);
  expect(matchUp?.winningSide).toEqual(2);

  // entering a value after winningSide is determined does nothing
  const { info, updated } = keyValueMatchUpScore({
    lowSide: 1,
    value: 2,
    matchUp,
    matchUpFormat,
  });
  expect(updated).toEqual(false);
  expect(info).toEqual('matchUp is complete');
});

it('can enter a three set win for side 1', () => {
  const matchUpFormat = FORMAT_STANDARD;
  let matchUp: any = { scoreString: undefined, sets: [], matchUpFormat };

  ({ matchUp } = keyValueMatchUpScore({
    lowSide: 1,
    value: 4,
    matchUp,
    matchUpFormat,
  }));

  expect(matchUp?.scoreString.trim()).toEqual('4-6');
  expect(matchUp?.sets).toMatchObject([
    { side1Score: 4, side2Score: 6, winningSide: 2 },
  ]);
  expect(matchUp?.sets[0].winningSide).toEqual(2);

  ({ matchUp } = keyValueMatchUpScore({
    lowSide: 2,
    value: 2,
    matchUp,
    matchUpFormat,
  }));
  expect(matchUp?.scoreString.trim()).toEqual('4-6 6-2');
  expect(matchUp?.sets.length).toEqual(2);
  expect(matchUp?.sets[1].winningSide).toEqual(1);

  ({ matchUp } = keyValueMatchUpScore({
    lowSide: 1,
    value: 1,
    matchUp,
    matchUpFormat,
  }));
  expect(matchUp?.scoreString.trim()).toEqual('4-6 6-2 1-6');
  expect(matchUp?.sets.length).toEqual(3);
  expect(matchUp?.sets[2].winningSide).toEqual(2);
  expect(matchUp?.winningSide).toEqual(2);

  const { updated } = keyValueMatchUpScore({
    lowSide: 1,
    value: 2,
    matchUp,
    matchUpFormat,
  });
  expect(updated).toEqual(false);
});

it('can enter a three set win for side 2', () => {
  const matchUpFormat = FORMAT_STANDARD;
  let matchUp: any = { scoreString: undefined, sets: [], matchUpFormat };

  ({ matchUp } = keyValueMatchUpScore({
    lowSide: 1,
    value: 4,
    matchUp,
    matchUpFormat,
  }));
  expect(matchUp?.scoreString.trim()).toEqual('4-6');
  expect(matchUp?.sets).toMatchObject([
    { side1Score: 4, side2Score: 6, winningSide: 2 },
  ]);

  ({ matchUp } = keyValueMatchUpScore({
    lowSide: 2,
    value: 2,
    matchUp,
    matchUpFormat,
  }));
  expect(matchUp?.scoreString.trim()).toEqual('4-6 6-2');
  expect(matchUp?.sets.length).toEqual(2);

  ({ matchUp } = keyValueMatchUpScore({
    lowSide: 2,
    value: 1,
    matchUp,
    matchUpFormat,
  }));
  expect(matchUp?.scoreString.trim()).toEqual('4-6 6-2 6-1');
  expect(matchUp?.sets.length).toEqual(3);
  expect(matchUp?.winningSide).toEqual(1);

  const { updated } = keyValueMatchUpScore({
    lowSide: 1,
    value: 2,
    matchUp,
    matchUpFormat,
  });
  expect(updated).toEqual(false);
});

it('can enter a first set tiebreak scoreString', () => {
  const matchUpFormat = FORMAT_STANDARD;
  let matchUp: any = { scoreString: undefined, sets: [], matchUpFormat };

  ({ matchUp } = keyValueMatchUpScore({
    lowSide: 2,
    value: 6,
    matchUp,
    matchUpFormat,
  }));
  expect(matchUp?.scoreString.trim()).toEqual('7-6(');
  expect(matchUp?.sets).toMatchObject([
    { side1Score: 7, side2Score: 6, winningSide: undefined },
  ]);

  ({ matchUp } = keyValueMatchUpScore({
    lowSide: 2,
    value: 2,
    matchUp,
    matchUpFormat,
  }));
  expect(matchUp?.scoreString.trim()).toEqual('7-6(2');
  expect(matchUp?.sets.length).toEqual(1);

  ({ matchUp } = keyValueMatchUpScore({
    lowSide: 2,
    value: 'space',
    matchUp,
    matchUpFormat,
  }));
  expect(matchUp?.scoreString.trim()).toEqual('7-6(2)');
  expect(matchUp?.sets.length).toEqual(1);
  expect(matchUp?.sets[0].winningSide).toEqual(1);
  expect(matchUp?.winningSide).toEqual(undefined);
});

it('can enter a second set tiebreak scoreString', () => {
  const matchUpFormat = FORMAT_STANDARD;
  let matchUp: any = { scoreString: undefined, sets: [], matchUpFormat };

  const values = [
    { lowSide: 2, value: 3 },
    { lowSide: 2, value: 6 },
    { lowSide: 2, value: 2 },
    TIEBREAK_CLOSER,
  ];

  ({ matchUp } = enterValues({ values, matchUp }));
  expect(matchUp.scoreString.trim()).toEqual('6-3 7-6(2)');
  expect(matchUp?.sets[0].winningSide).toEqual(1);
  expect(matchUp?.sets[1].winningSide).toEqual(1);
  expect(matchUp.winningSide).toEqual(1);
});

it('supports space for completing tiebreak scores', () => {
  const matchUpFormat = FORMAT_STANDARD;
  let matchUp: any = { scoreString: undefined, sets: [], matchUpFormat };

  const values = [
    { lowSide: 2, value: 6 },
    { lowSide: 2, value: 2 },
    { value: 'space' },
    { lowSide: 2, value: 6 },
    { lowSide: 2, value: 2 },
    { value: 'space' },
  ];

  ({ matchUp } = enterValues({ values, matchUp }));
  expect(matchUp.scoreString.trim()).toEqual('7-6(2) 7-6(2)');
  expect(matchUp?.sets[0].winningSide).toEqual(1);
  expect(matchUp?.sets[1].winningSide).toEqual(1);
  expect(matchUp.winningSide).toEqual(1);
});

it('supports three tiebreak sets', () => {
  const matchUpFormat = FORMAT_STANDARD;
  let matchUp: any = { scoreString: undefined, sets: [], matchUpFormat };

  const values = [
    { lowSide: 2, value: 6 },
    { lowSide: 2, value: 2 },
    { value: 'space' },
    { lowSide: 1, value: 6 },
    { lowSide: 1, value: 4 },
    TIEBREAK_CLOSER,
    { lowSide: 2, value: 6 },
    { lowSide: 2, value: 2 },
    { value: 'space' },
  ];

  ({ matchUp } = enterValues({ values, matchUp }));
  expect(matchUp.scoreString.trim()).toEqual('7-6(2) 6-7(4) 7-6(2)');
  expect(matchUp?.sets[0].winningSide).toEqual(1);
  expect(matchUp?.sets[1].winningSide).toEqual(2);
  expect(matchUp?.sets[2].winningSide).toEqual(1);
  expect(matchUp.winningSide).toEqual(1);
});

it('can handle scoreString deletions', () => {
  const matchUpFormat = FORMAT_STANDARD;
  let matchUp: any = { scoreString: undefined, sets: [], matchUpFormat };

  const values = [
    { lowSide: 2, value: 3 },
    { lowSide: 2, value: 6 },
    { lowSide: 2, value: 2 },
    { value: 'backspace' },
    { value: 'backspace' },
    { lowSide: 2, value: 5 },
  ];

  ({ matchUp } = enterValues({ values, matchUp }));
  // test that tiebreak can be converted into win by 2 with scoreString = setTo + 1
  expect(matchUp.scoreString.trim()).toEqual('6-3 7-5');
  expect(matchUp.winningSide).toEqual(1);
});

it('does not allow more than two digits for set tiebreaks', () => {
  const matchUpFormat = FORMAT_STANDARD;
  let matchUp: any = { scoreString: undefined, sets: [], matchUpFormat };

  const values = [
    { lowSide: 2, value: 6 },
    { lowSide: 2, value: 1 },
    { lowSide: 2, value: 1 },
  ];

  ({ matchUp } = enterValues({ values, matchUp }));
  expect(matchUp.scoreString.trim()).toEqual('7-6(11');
  expect(matchUp?.sets?.length).toEqual(1);

  const { matchUp: scoredMatchUp, info } = scoreMatchUp({
    value: '1',
    lowSide: 1,
    matchUp,
  });
  expect(scoredMatchUp.scoreString.trim()).toEqual('7-6(11');
  expect(info).toEqual('tiebreak digit limit');
});
