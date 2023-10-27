import { categoryCanContain } from '../functions/deducers/categoryCanContain';
import { expect, it } from 'vitest';

const scenarios = [
  {
    scenario: {
      childCategory: { ageCategoryCode: 'U16' },
      category: { ageCategoryCode: 'U18' },
    },
    expectation: { valid: true },
  },
  {
    scenario: {
      childCategory: { ageCategoryCode: 'U18' },
      category: { ageCategoryCode: 'U14' },
    },
    expectation: { invalidAgeMax: true },
  },
  {
    scenario: {
      childCategory: { ageCategoryCode: 'O18' },
      category: { ageCategoryCode: 'U14' },
    },
    expectation: { invalidAgeMin: true, invalidAgeMaxDate: true },
  },
  {
    scenario: {
      childCategory: { ageMaxDate: '2005-10-26' },
      category: { ageMinDate: '2009-10-28' },
    },
    expectation: { invalidAgeMaxDate: true },
  },
  {
    scenario: {
      childCategory: { ageCategoryCode: 'U18' },
      category: { ageCategoryCode: 'O20' },
    },
    expectation: { invalidAgeMax: true, invalidAgeMinDate: true },
  },
  {
    scenario: {
      childCategory: { ageMinDate: '2005-10-28' },
      category: { ageMaxDate: '2003-10-26' },
    },
    expectation: { invalidAgeMinDate: true },
  },
];

it.each(scenarios.slice(0))(
  'can determine whether categories can contain other categories',
  ({ scenario, expectation }) => {
    const result = categoryCanContain(scenario);
    if (expectation) {
      expect(result).toEqual(expectation);
    } else {
      console.log({ scenario }, result);
    }
  }
);
