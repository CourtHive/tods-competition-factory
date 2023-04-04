import { generatePersonData } from '../generators/generatePersonData';
import { instanceCount } from '../../utilities';
import { it, expect } from 'vitest';

import { FEMALE, MALE } from '../../constants/genderConstants';

it('can generation personData', () => {
  let { personData } = generatePersonData();
  expect(personData.length).toEqual(100);

  for (const person of personData) {
    expect(person.nationalityCode).not.toBeUndefined();
    expect(person.firstName).not.toBeUndefined();
    expect(person.lastName).not.toBeUndefined();
    expect(person.sex).not.toBeUndefined();
  }

  let count = 200;
  personData = generatePersonData({ count, sex: MALE }).personData;
  expect(personData.length).toEqual(count);
  expect(instanceCount(personData.map(({ sex }) => sex))).toEqual({
    MALE: count,
  });

  count = 50;
  personData = generatePersonData({ count, sex: FEMALE }).personData;
  expect(personData.length).toEqual(count);
  expect(instanceCount(personData.map(({ sex }) => sex))).toEqual({
    FEMALE: count,
  });
});
