import { lengthOrZero } from '@Tools/arrays';
import { expect, test } from 'vitest';

test('lengthOrZero', () => {
  expect(lengthOrZero('')).toEqual(0);
  // @ts-expect-error missing params
  expect(lengthOrZero()).toEqual(0);
  expect(lengthOrZero([])).toEqual(0);
  expect(lengthOrZero([1])).toEqual(1);
  expect(lengthOrZero([1, 2])).toEqual(2);
});
