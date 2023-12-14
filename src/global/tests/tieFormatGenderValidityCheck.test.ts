import { expect, it } from 'vitest';
import {
  anyMixedError,
  tieFormatGenderValidityCheck,
  mixedGenderError,
} from '../functions/deducers/tieFormatGenderValidityCheck';

import { DOUBLES_MATCHUP, SINGLES_MATCHUP } from '../../constants/matchUpTypes';
import { INVALID_GENDER } from '../../constants/errorConditionConstants';
import { GenderEnum, TypeEnum } from '../../types/tournamentFromSchema';

const referenceEvent = { eventType: TypeEnum.Team, eventId: 'eventId' };

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
      stack: ['tieFormatGenderValidityCheck'],
      error: INVALID_GENDER,
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
      stack: ['tieFormatGenderValidityCheck'],
      error: INVALID_GENDER,
      gender: 'ANY',
      valid: false,
    },
  },
  {
    params: {
      referenceGender: GenderEnum.Male,
      gender: GenderEnum.Female,
    },
    expectation: {
      stack: ['tieFormatGenderValidityCheck'],
      error: INVALID_GENDER,
      gender: 'FEMALE',
      valid: false,
    },
  },
  {
    params: {
      referenceGender: GenderEnum.Female,
      gender: GenderEnum.Male,
    },
    expectation: {
      stack: ['tieFormatGenderValidityCheck'],
      error: INVALID_GENDER,
      gender: 'MALE',
      valid: false,
    },
  },
  {
    params: {
      referenceGender: GenderEnum.Female,
      gender: GenderEnum.Mixed,
    },
    expectation: {
      stack: ['tieFormatGenderValidityCheck'],
      error: INVALID_GENDER,
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
      referenceGender: GenderEnum.Female,
      gender: GenderEnum.Any,
    },
    expectation: {
      stack: ['tieFormatGenderValidityCheck'],
      error: INVALID_GENDER,
      gender: 'ANY',
      valid: false,
    },
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
    expectation: {
      info: anyMixedError,
      stack: ['tieFormatGenderValidityCheck'],
      error: INVALID_GENDER,
      valid: false,
    },
  },
  {
    params: {
      referenceGender: GenderEnum.Any,
      matchUpType: DOUBLES_MATCHUP,
      gender: GenderEnum.Mixed,
    },
    expectation: { valid: true },
  },
  {
    params: {
      referenceGender: GenderEnum.Any,
      matchUpType: DOUBLES_MATCHUP,
      gender: GenderEnum.Male,
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
      stack: ['tieFormatGenderValidityCheck'],
      error: INVALID_GENDER,
      info: mixedGenderError,
      valid: false,
    },
  },
  {
    params: {
      referenceGender: GenderEnum.Mixed,
      matchUpType: DOUBLES_MATCHUP,
      gender: GenderEnum.Mixed,
      referenceEvent,
    },
    expectation: { valid: true },
  },
  {
    params: {
      referenceGender: GenderEnum.Mixed,
      matchUpType: DOUBLES_MATCHUP,
      gender: GenderEnum.Female,
      referenceEvent,
    },
    expectation: { valid: true },
  },
  {
    params: {
      referenceGender: GenderEnum.Mixed,
      matchUpType: SINGLES_MATCHUP,
      gender: GenderEnum.Female,
      referenceEvent,
    },
    expectation: { valid: true },
  },
  {
    params: {
      referenceGender: GenderEnum.Mixed,
      matchUpType: SINGLES_MATCHUP,
      gender: GenderEnum.Male,
      referenceEvent,
    },
    expectation: { valid: true },
  },
  {
    params: {
      referenceGender: GenderEnum.Mixed,
      matchUpType: DOUBLES_MATCHUP,
      gender: GenderEnum.Male,
      referenceEvent,
    },
    expectation: { valid: true },
  },
  {
    params: {
      referenceGender: GenderEnum.Mixed,
      matchUpType: SINGLES_MATCHUP,
      gender: GenderEnum.Any,
    },
    expectation: {
      stack: ['tieFormatGenderValidityCheck'],
      info: mixedGenderError,
      error: INVALID_GENDER,
      valid: false,
    },
  },
  {
    params: {
      referenceGender: GenderEnum.Mixed,
      matchUpType: DOUBLES_MATCHUP,
      gender: GenderEnum.Any,
    },
    expectation: {
      stack: ['tieFormatGenderValidityCheck'],
      info: mixedGenderError,
      error: INVALID_GENDER,
      valid: false,
    },
  },
];

it.each(scenarios)('can test gender validity', (scenario) => {
  const result = tieFormatGenderValidityCheck(scenario.params);
  expect(result).toEqual(scenario.expectation);
});
