import { extractTime } from '../dateTime';

it('extracts time properly', () => {
  let time = extractTime('2001-01-01T10:00');
  expect(time).toEqual('10:00');
  time = extractTime('10:00');
  expect(time).toEqual('10:00');
  time = extractTime('2001-01-01');
  expect(time).toBeUndefined();
});
