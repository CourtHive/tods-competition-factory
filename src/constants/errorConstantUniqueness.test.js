import { unique } from '../utilities';

import errorConditionConstants from './errorConditionConstants';

test('all error codes are unique', () => {
  const codes = Object.values(errorConditionConstants)
    .map((value) => typeof value === 'object' && value.code)
    .filter(Boolean);
  expect(codes.length).toEqual(unique(codes).length);
});
