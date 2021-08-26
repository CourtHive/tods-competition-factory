import {
  addMinutesToTimeString,
  addWeek,
  convertTime,
  dateFromDay,
  DateHHMM,
  dateRange,
  formatDate,
  getDateByWeek,
  HHMMSS,
  isDate,
  localizeDate,
  subtractWeek,
  timeSort,
  timeUTC,
  weekDays,
} from '../dateTime';
import { JSON2CSV } from '../json';
import { countValues } from '..';
import {
  arrayIndices,
  chunkByNth,
  chunkSizeProfile,
  groupConsecutiveNumbers,
  inPlaceSubSort,
  occurrences,
  subSort,
  overlap,
} from '../arrays';
import { isOdd, nextPowerOf2, isPowerOf2 } from '../math';

it('can count values and determine active drawPositions', () => {
  const drawPositions = [1, 1, 2, 3, 4, 5, 5, 6];
  const positionCounts = countValues(drawPositions);
  const activeDrawPositions = Object.keys(positionCounts)
    .reduce((active, key) => {
      return +key > 1 ? active.concat(...positionCounts[key]) : active;
    }, [])
    .map((p) => parseInt(p));
  expect(activeDrawPositions).toMatchObject([1, 5]);
});

it('can create CSV from shallow JSON objects', () => {
  const csv = JSON2CSV([{ a: '1', b: '2' }]);
  expect(csv).not.toBeUndefined;

  const result = JSON2CSV();
  expect(result.error).not.toBeUndefined();
});

test('isDate recognizes Invalid Date', () => {
  // only date objects and valid time values return true
  let date = new Date('2007-01-01');
  let result = isDate(date);
  expect(result).toEqual(true);

  date = new Date('2007-01-01').getTime();
  result = isDate(date);
  expect(result).toEqual(true);

  // everything else is false

  // booleans are not dates
  result = isDate(true);
  expect(result).toEqual(false);

  // date strings are not date objects
  result = isDate('2007-01-01');
  expect(result).toEqual(false);

  // 'Invalid Date' is not a date
  date = new Date('xxx');
  result = isDate(date);
  expect(result).toEqual(false);
});

test('DateHHMM returns formatted time string from seconds', () => {
  let result = DateHHMM(new Date());
  expect(result.split(':').map((x) => isNaN(x))).toEqual([false, false]);

  const seconds = 10000;
  result = HHMMSS(seconds);
  expect(result).toEqual('02:46:40');
});

test('converTime supports both 12 and 24 hour formats', () => {
  let result = convertTime('1:00 PM', true);
  expect(result).toEqual('13:00');
  result = convertTime('1:00 PM');
  expect(result).toEqual('1:00 PM');

  result = convertTime('1:00 AM', true);
  expect(result).toEqual('01:00');
  result = convertTime('12:00 AM', true);
  expect(result).toEqual('00:00');

  result = convertTime('12:00');
  expect(result).toEqual('12:00 PM');
  result = convertTime('00:00');
  expect(result).toEqual('12:00 AM');
  result = convertTime('01:00');
  expect(result).toEqual('1:00 AM');
  result = convertTime('13:00');
  expect(result).toEqual('1:00 PM');
  result = convertTime('13:00', true);
  expect(result).toEqual('13:00');
});

test('miscellaneous date/time tests', () => {
  const times = ['09:00', '10:00', '07:00', '13:00', '11:30', '09:30'];
  let result = times.sort(timeSort);
  expect(result).toEqual([
    '07:00',
    '09:00',
    '09:30',
    '10:00',
    '11:30',
    '13:00',
  ]);

  result = weekDays();
  expect(result.length).toEqual(7);

  result = weekDays('');
  expect(result).toEqual([]);

  result = weekDays(new Date('2020-12-29'));
  expect(result).toEqual([
    '2020-12-27',
    '2020-12-28',
    '2020-12-29',
    '2020-12-30',
    '2020-12-31',
    '2021-01-01',
    '2021-01-02',
  ]);

  // first day of week 1 => Monday
  result = weekDays(new Date('2020-12-29'), 1);
  expect(result).toEqual([
    '2020-12-28',
    '2020-12-29',
    '2020-12-30',
    '2020-12-31',
    '2021-01-01',
    '2021-01-02',
    '2021-01-03',
  ]);

  let date = '2020-01-01T00:00';
  result = addWeek(date);
  expect(result).toEqual('2020-01-08');
  date = '2020-01-02';
  result = addWeek(date);
  expect(result).toEqual('2020-01-09');
  date = '2019-12-31';
  result = addWeek(date);
  expect(result).toEqual('2020-01-07');
  date = '2020-01-07';
  result = subtractWeek(date);
  expect(result).toEqual('2019-12-31');

  date = getDateByWeek(45, 2023);
  expect(date).toEqual('2023-11-06');
  date = dateFromDay(2020, 99);
  expect(date).toEqual('2020-04-08');

  result = addMinutesToTimeString();
  expect(result).toEqual('00:00');

  result = timeUTC();
  expect(!isNaN(result)).toEqual(true);
  result = timeUTC('2020-01-01');
  expect(!isNaN(result)).toEqual(true);

  result = localizeDate();
  expect(result).toEqual(false);
  result = localizeDate('2020-01-01');
  // expect(result).toEqual('Wednesday, January 1, 2020');
  result = localizeDate(new Date('2020-01-01'));
  // expect(result).toEqual('Wednesday, January 1, 2020');

  result = dateRange();
  expect(result).toEqual([]);

  result = dateRange('2020-01-01', '2020-02-01');
  expect(result.length).toEqual(32);
});

test('formatDate supports multiple formats', () => {
  let result = formatDate('2020-01-01T00:00');
  expect(result).toEqual('2020-01-01');
  result = formatDate('2020-01-02', undefined, 'MDY');
  expect(result).toEqual('01-02-2020');
  result = formatDate('2020-01-02', undefined, 'DMY');
  expect(result).toEqual('02-01-2020');
  result = formatDate('2020-01-02', undefined, 'YDM');
  expect(result).toEqual('2020-02-01');
  result = formatDate('2020-01-02', undefined, 'DYM');
  expect(result).toEqual('02-2020-01');
  result = formatDate('2020-01-02', undefined, 'MYD');
  expect(result).toEqual('01-2020-02');
});

test('miscellaneous math tests', () => {
  let result = isPowerOf2(3);
  expect(result).toEqual(false);

  result = isPowerOf2();
  expect(result).toEqual(false);

  result = nextPowerOf2();
  expect(result).toEqual(false);
  result = nextPowerOf2(3);
  expect(result).toEqual(4);
  result = nextPowerOf2(2);
  expect(result).toEqual(2);

  result = isOdd(1);
  expect(result).toEqual(true);
  result = isOdd('1');
  expect(result).toEqual(true);
  result = isOdd(2);
  expect(result).toEqual(false);
  result = isOdd('2');
  expect(result).toEqual(false);
  result = isOdd();
  expect(result).toEqual(undefined);
});

test('miscellaneous array tests', () => {
  let result = arrayIndices(1, [1, 3, 1, 2, 2, 1, 0]);
  expect(result).toEqual([0, 2, 5]);
  result = occurrences(1, [1, 3, 1, 2, 2, 1, 0]);
  expect(result).toEqual(3);

  result = chunkSizeProfile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [2, 3]);
  expect(result).toEqual([
    [1, 2],
    [3, 4, 5],
    [6, 7],
    [8, 9, 10],
  ]);

  result = groupConsecutiveNumbers([1, 2, 3, 4, 5, 6]);
  expect(result).toEqual([[1, 2, 3, 4, 5, 6]]);
  result = groupConsecutiveNumbers([1, 3, 4, 6, 7, 9, 23, 24]);
  expect(result).toEqual([[1], [3, 4], [6, 7], [9], [23, 24]]);

  result = chunkByNth([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 3);
  expect(result).toEqual([
    [1, 4, 7, 10],
    [2, 5, 8, 11],
    [3, 6, 9, 12],
  ]);
  result = chunkByNth([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 3, true);
  expect(result).toEqual([
    [1, 6, 7, 12],
    [2, 5, 8, 11],
    [3, 4, 9, 10],
  ]);

  result = chunkByNth([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 4);
  expect(result).toEqual([
    [1, 5, 9],
    [2, 6, 10],
    [3, 7, 11],
    [4, 8, 12],
  ]);
  result = chunkByNth([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 4, true);
  expect(result).toEqual([
    [1, 8, 9],
    [2, 7, 10],
    [3, 6, 11],
    [4, 5, 12],
  ]);

  const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  result = subSort(array, 3, 4, (a, b) => b - a);
  expect(result).toEqual([1, 2, 3, 7, 6, 5, 4, 8, 9, 10]);
  expect(result).not.toEqual(array);

  result = inPlaceSubSort(array, 3, 4, (a, b) => b - a);
  expect(result).toEqual(array);
});

test('overlap detects the presence of an intersection of two arrays', () => {
  let hasOverlap = overlap([1, 2], [3, 4, 6, 2, 7]);
  expect(hasOverlap).toEqual(true);
  hasOverlap = overlap([1, 2], [3, 4, 6, 7]);
  expect(hasOverlap).toEqual(false);
});
