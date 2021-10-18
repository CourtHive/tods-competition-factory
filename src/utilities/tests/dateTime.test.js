import {
  dayMinutesToTimeString,
  extractTime,
  formatDate,
  militaryTime,
  offsetTime,
  tidyTime,
} from '../dateTime';

it('extracts time properly', () => {
  let time = extractTime('2001-01-01T10:00');
  expect(time).toEqual('10:00');
  time = extractTime('10:00');
  expect(time).toEqual('10:00');
  time = extractTime('2001-01-01');
  expect(time).toBeUndefined();
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
});
