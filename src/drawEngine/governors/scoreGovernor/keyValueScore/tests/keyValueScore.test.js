import {
  INCOMPLETE,
  TO_BE_PLAYED,
} from '../../../../../constants/matchUpStatusConstants';
import { OUTCOME_COMPLETE } from '../constants';
import { keyValueScore } from '../index';
import { FORMAT_STANDARD, TIMED20 } from './formatConstants';

function enterKeyValues({
  sets,
  score,
  matchUpFormat,
  matchUpStatus,
  shiftFirst,
  valuePairs,
}) {
  let updated, winningSide;

  valuePairs.forEach(valuePair => {
    const { value, lowSide = 2 } = valuePair;
    ({ updated, sets, score, winningSide, matchUpStatus } = keyValueScore({
      value,
      lowSide,

      sets,
      score,
      matchUpStatus,
      matchUpFormat,
      shiftFirst,
    }));
  });

  return { updated, sets, score, matchUpStatus, winningSide, matchUpFormat };
}

it('can modify score string', () => {
  const { updated, score: updatedScore } = keyValueScore({
    value: '0',
    lowSide: 2,

    sets: [],
    score: '',
    matchUpStatus: '',
    matchUpFormat: FORMAT_STANDARD,
  });

  expect(updated).toEqual(true);
  expect(updatedScore).toEqual('6-0 ');
});

it('can use valuePairs', () => {
  const valuePairs = [
    { lowSide: 1, value: '0' },
    { lowSide: 1, value: '0' },
  ];

  const result = enterKeyValues({
    sets: [],
    score: '',
    matchUpFormat: FORMAT_STANDARD,
    valuePairs,
    shiftFirst: false,
  });

  expect(result.score).toEqual('0-6 0-6 ');
});

it('can shiftFirst', () => {
  const valuePairs = [
    { lowSide: 2, value: '0' },
    { lowSide: 2, value: '0' },
  ];

  const result = enterKeyValues({
    sets: [],
    score: '',
    matchUpFormat: FORMAT_STANDARD,
    valuePairs,
    shiftFirst: true,
  });

  expect(result.score).toEqual('0-6 0-6 ');
});

it('can delete values', () => {
  const valuePairs = [
    { lowSide: 1, value: '0' },
    { lowSide: 1, value: '0' },
    { lowSide: 1, value: 'backspace' },
  ];

  const result = enterKeyValues({
    sets: [],
    score: '',
    matchUpFormat: FORMAT_STANDARD,
    valuePairs,
    shiftFirst: false,
  });

  expect(result.score).toEqual('0-6 0-');

  const nextResult = enterKeyValues(
    Object.assign({}, result, {
      valuePairs: [{ lowSide: 1, value: '6' }],
      shiftFirst: false,
    })
  );

  expect(nextResult.score.trim()).toEqual('0-6 0-6');
});

it('can complete existing score', () => {
  const valuePairs = [{ lowSide: 2, value: '0' }];

  const result = enterKeyValues({
    sets: [
      {
        setNumber: 1,
        side1Score: 7,
        side1TiebreakScore: 7,
        side2Score: 6,
        side2TiebreakScore: 3,
        winningSide: 1,
      },
    ],
    score: '7-6(3)',
    matchUpFormat: FORMAT_STANDARD,
    matchUpStatus: INCOMPLETE,
    valuePairs,
    shiftFirst: false,
  });

  expect(result.matchUpStatus).toEqual(OUTCOME_COMPLETE);
});

it('can complete timed scores', () => {
  const valuePairs = [
    { lowSide: 2, value: '0' },
    { lowSide: 2, value: '-' },
    { lowSide: 2, value: '8' },
  ];

  const result = enterKeyValues({
    sets: [],
    score: undefined,
    matchUpFormat: TIMED20,
    matchUpStatus: TO_BE_PLAYED,
    valuePairs,
    shiftFirst: false,
  });

  expect(result.score).toEqual('0-8');
});

it('can properly backspace in timed sets', () => {
  const valuePairs = [
    { lowSide: 2, value: '1' },
    { lowSide: 2, value: '-' },
    { lowSide: 2, value: '1' },
  ];

  const result = enterKeyValues({
    sets: [],
    score: undefined,
    matchUpFormat: TIMED20,
    matchUpStatus: TO_BE_PLAYED,
    valuePairs,
    shiftFirst: false,
  });

  expect(result.score).toEqual('1-1');

  const nextResult = enterKeyValues(
    Object.assign({}, result, {
      valuePairs: [
        { lowSide: 1, value: 'backspace' },
        { lowSide: 1, value: '8' },
      ],
      shiftFirst: false,
    })
  );

  expect(nextResult.score.trim()).toEqual('1-8');
});

it('can properly backspace in timed sets', () => {
  const valuePairs = [
    { lowSide: 2, value: '0' },
    { lowSide: 2, value: '-' },
    { lowSide: 2, value: '0' },
  ];

  const result = enterKeyValues({
    sets: [],
    score: undefined,
    matchUpFormat: TIMED20,
    matchUpStatus: TO_BE_PLAYED,
    valuePairs,
    shiftFirst: false,
  });

  expect(result.score).toEqual('0-0');

  const nextResult = enterKeyValues(
    Object.assign({}, result, {
      valuePairs: [
        { lowSide: 1, value: 'backspace' },
        { lowSide: 1, value: '8' },
      ],
      shiftFirst: false,
    })
  );

  expect(nextResult.score.trim()).toEqual('0-8');
});
