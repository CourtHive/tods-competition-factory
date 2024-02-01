import { simpleAddition } from '@Functions/reducers/simpleAddition';
import { expect, test } from 'vitest';

test('simpleAddition', () => {
  expect(simpleAddition()).toEqual(0);
  expect(simpleAddition(1)).toEqual(1);
  expect(simpleAddition(2)).toEqual(2);
  expect(simpleAddition(1, 3)).toEqual(4);
  expect(simpleAddition(1, 1)).toEqual(2);
  expect(simpleAddition(0, 2)).toEqual(2);
  expect(simpleAddition('a', 'b')).toEqual(0);
  expect(simpleAddition('a', 3)).toEqual(3);
  expect(simpleAddition(2, 'b')).toEqual(2);
});
