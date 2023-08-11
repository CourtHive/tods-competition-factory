import { expect, it, test } from 'vitest';
import {
  getUTCdateString,
  dayMinutesToTimeString,
  extractTime,
  formatDate,
  militaryTime,
  offsetTime,
  tidyTime,
  timeUTC,
  dateRange,
  timeStringMinutes,
  splitTime,
  timeSort,
} from '../dateTime';

const date200101 = '2020-01-01';
const date201001 = '2020-10-01';

it('extracts time properly', () => {
  let time = extractTime('2001-01-01T10:00');
  expect(time).toEqual('10:00');
  time = extractTime('10:00');
  expect(time).toEqual('10:00');
  time = extractTime('2001-01-01');
  expect(time).toBeUndefined();
});

test('dateRange reliably generates a range', () => {
  let result = dateRange(date200101, '2020-01-04');
  expect(result).toEqual([
    date200101,
    '2020-01-02',
    '2020-01-03',
    '2020-01-04',
  ]);
});

test('functions with bad data', () => {
  let result = formatDate();
  expect(result).toEqual('');
  result = offsetTime();
  expect(typeof result === 'number').toEqual(true);
  result = tidyTime('25:00');
  expect(result).toBeUndefined();
  result = tidyTime('12:80');
  expect(result).toBeUndefined();
  result = dayMinutesToTimeString(10000);
  expect(typeof result === 'string').toEqual(true);
  result = militaryTime();
  expect(result).toEqual('00:00');
  result = militaryTime({ foo: 1 });
  expect(result).toEqual('00:00');
  //result = militaryTime('abcdefg');
  // expect(result).toEqual('00:00');
  result = militaryTime('1:00');
  expect(result).toEqual('01:00');
  result = militaryTime('1:00 pm');
  expect(result).toEqual('13:00');
  result = getUTCdateString(new Date(date201001));
  expect(result).toEqual(date201001);
  result = getUTCdateString(date201001);
  expect(result).toEqual(date201001);
  result = getUTCdateString(new Date('2020-09-01'));
  expect(result).toEqual('2020-09-01');
  result = timeUTC();
  expect(!isNaN(result)).toEqual(true);
  result = timeUTC(date200101);
  expect(!isNaN(result)).toEqual(true);
  result = timeUTC(new Date(date200101));
  expect(!isNaN(result)).toEqual(true);
});

test('miscellaneous', () => {
  let result = timeStringMinutes();
  expect(result).toEqual(0);

  // splitTime is only used internally
  result = splitTime('aa:bb xx');
  expect(result).toEqual({});

  result = ['08:45', '08:35'].sort(timeSort);
  expect(result).toEqual(['08:35', '08:45']);
});
