import { safePct } from '@Tools/math';
import { expect, test } from 'vitest';

test('safePct', () => {
  expect(safePct(0, 0)).toEqual(0);
  expect(safePct(0, 1)).toEqual(0);
  expect(safePct(1, 0)).toEqual(0);
  expect(safePct(1, 1)).toEqual(100);
  expect(safePct(1, 2)).toEqual(50);
  expect(safePct(2, 1)).toEqual(200);
  expect(safePct(2, 0)).toEqual(0);
  expect(safePct(0, 2)).toEqual(0);
  expect(safePct(0, 2, false)).toEqual(0);
  expect(safePct(0, 2, true)).toEqual(0);
  expect(safePct(0, 2, false)).toEqual(0);
});
