import { validTimePeriod } from './time';

test('validTime', () => {
  let result = validTimePeriod();
  expect(result).toEqual(false);

  result = validTimePeriod({ startTime: '13:00', endTime: '12:00' });
  expect(result).toEqual(false);

  result = validTimePeriod({ startTime: '24:00', endTime: '12:00' });
  expect(result).toEqual(false);

  result = validTimePeriod({ startTime: '14:00', endTime: '32:00' });
  expect(result).toEqual(false);

  result = validTimePeriod({ startTime: '14:30', endTime: '14:20' });
  expect(result).toEqual(false);

  result = validTimePeriod({ startTime: '12:00', endTime: '13:00' });
  expect(result).toEqual(true);
});
