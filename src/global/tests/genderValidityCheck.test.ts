import { genderValidityCheck } from '../functions/deducers/genderValidityCheck';
import { expect, it } from 'vitest';

import { DOUBLES_MATCHUP, SINGLES_MATCHUP } from '../../constants/matchUpTypes';
import { GenderEnum } from '../../types/tournamentFromSchema';
import { INVALID_GENDER } from '../../constants/errorConditionConstants';

const scenarios = [
  {
    params: {
      referenceGender: GenderEnum.Male,
      gender: GenderEnum.Male,
    },
    expectation: { valid: true },
  },
  {
    params: {
      referenceGender: GenderEnum.Female,
      gender: GenderEnum.Female,
    },
    expectation: { valid: true },
  },
  {
    params: {
      referenceGender: GenderEnum.Any,
      matchUpType: DOUBLES_MATCHUP,
      gender: GenderEnum.Female,
    },
    expectation: { valid: true },
  },
  {
    params: {
      referenceGender: GenderEnum.Any,
      matchUpType: SINGLES_MATCHUP,
      gender: GenderEnum.Female,
    },
    expectation: { valid: true },
  },
  {
    params: {
      referenceGender: GenderEnum.Mixed,
      matchUpType: DOUBLES_MATCHUP,
      gender: GenderEnum.Female,
    },
    expectation: { valid: true },
  },
  {
    params: {
      referenceGender: GenderEnum.Mixed,
      matchUpType: SINGLES_MATCHUP,
      gender: GenderEnum.Female,
    },
    expectation: {
      info: 'matchUpType SINGLES is invalid for gender MIXED',
      stack: ['genderValidityCheck'],
      error: INVALID_GENDER,
      valid: false,
    },
  },
  {
    params: {
      referenceGender: GenderEnum.Female,
      gender: GenderEnum.Male,
    },
    expectation: {
      stack: ['genderValidityCheck'],
      error: INVALID_GENDER,
      gender: 'MALE',
      valid: false,
    },
  },
  {
    params: {
      referenceGender: GenderEnum.Male,
      gender: GenderEnum.Female,
    },
    expectation: {
      stack: ['genderValidityCheck'],
      error: INVALID_GENDER,
      gender: 'FEMALE',
      valid: false,
    },
  },
];

it.each(scenarios)('can test gender validity', (scenario) => {
  const result = genderValidityCheck(scenario.params);
  expect(result).toEqual(scenario.expectation);
});
