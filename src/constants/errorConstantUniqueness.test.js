import { expect, test } from 'vitest';
import { unique } from '../utilities';

import errorConditionConstants from './errorConditionConstants';

test('all error codes are unique', () => {
  const isUpperCase = (str) => /^[A-Z_]+$/.test(str);
  const codes = Object.values(errorConditionConstants).map(
    (value) => value.code
  );
  expect(codes.length).toEqual(unique(codes).length);
  const allUpperCaseCodes = codes.every(isUpperCase);
  if (!allUpperCaseCodes) {
    const errors = codes.filter((code) => !isUpperCase(code));
    console.log('CASE ERROR', errors);
  }
  expect(allUpperCaseCodes).toBeTruthy();
});
