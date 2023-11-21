import { genderValidityCheck } from '../functions/deducers/genderValidityCheck';
import { expect, it } from 'vitest';

import { DOUBLES_MATCHUP, SINGLES_MATCHUP } from '../../constants/matchUpTypes';
import { INVALID_GENDER } from '../../constants/errorConditionConstants';
import { GenderEnum } from '../../types/tournamentFromSchema';

const errorInfo = 'MIXED events can only contain MIXED doubles collections';

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
      referenceGender: GenderEnum.Male,
      gender: GenderEnum.Mixed,
    },
    expectation: {
      error: INVALID_GENDER,
      stack: ['genderValidityCheck'],
      gender: 'MIXED',
      valid: false,
    },
  },
  {
    params: {
      referenceGender: GenderEnum.Male,
      gender: GenderEnum.Any,
    },
    expectation: {
      error: INVALID_GENDER,
      stack: ['genderValidityCheck'],
      gender: 'ANY',
      valid: false,
    },
  },
  {
    params: {
      referenceGender: GenderEnum.Female,
      gender: GenderEnum.Mixed,
    },
    expectation: {
      error: INVALID_GENDER,
      stack: ['genderValidityCheck'],
      gender: 'MIXED',
      valid: false,
    },
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
      referenceGender: GenderEnum.Any,
      matchUpType: SINGLES_MATCHUP,
      gender: GenderEnum.Mixed,
    },
    expectation: { valid: true },
  },
  {
    params: {
      referenceGender: GenderEnum.Mixed,
      matchUpType: SINGLES_MATCHUP,
      gender: GenderEnum.Mixed,
    },
    expectation: {
      error: INVALID_GENDER,
      stack: ['genderValidityCheck'],
      info: errorInfo,
      valid: false,
    },
  },
  {
    params: {
      referenceGender: GenderEnum.Mixed,
      matchUpType: DOUBLES_MATCHUP,
      gender: GenderEnum.Mixed,
    },
    expectation: { valid: true },
  },
  {
    params: {
      referenceGender: GenderEnum.Mixed,
      matchUpType: DOUBLES_MATCHUP,
      gender: GenderEnum.Female,
    },
    expectation: {
      error: INVALID_GENDER,
      stack: ['genderValidityCheck'],
      info: errorInfo,
      valid: false,
    },
  },
  {
    params: {
      referenceGender: GenderEnum.Mixed,
      matchUpType: SINGLES_MATCHUP,
      gender: GenderEnum.Female,
    },
    expectation: {
      stack: ['genderValidityCheck'],
      error: INVALID_GENDER,
      info: errorInfo,
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
