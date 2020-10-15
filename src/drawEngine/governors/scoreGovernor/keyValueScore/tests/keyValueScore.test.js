import { keyValueScore } from '../index';
import { FORMAT_STANDARD } from './formatConstants';

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

  return { updated, sets, score, matchUpStatus, winningSide };
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
    { lowSide: 1, value: '6' },
  ];

  const result = enterKeyValues({
    sets: [],
    score: '',
    matchUpFormat: FORMAT_STANDARD,
    valuePairs,
    shiftFirst: false,
  });

  const { score, sets, winningSide } = result;
  console.log({ score, sets, winningSide });
});
