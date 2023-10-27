import { getCategoryAgeDetails } from '../functions/getCategoryAgeDetails';
import { expect, it } from 'vitest';

const consideredDate = '2023-10-26';
const scenarios = [
  {
    category: {
      ageCategoryCode: 'U18',
      ageMinDate: '2018-06-06',
      ageMaxDate: '2018-06-06',
    },
    expectation: {
      errors: ['Invalid submitted ageMinDate: 2018-06-06'],
      ageMinDate: '2005-10-27',
      ageMaxDate: '2018-06-06',
      consideredDate,
      ageMax: 17,
    },
  },
  {
    category: {
      ageCategoryCode: 'U18',
      ageMin: 8,
    },
    expectation: {
      ageMaxDate: '2015-10-28',
      ageMinDate: '2005-10-27',
      consideredDate,
      ageMax: 17,
      ageMin: 8,
    },
  },
  {
    category: {
      categoryName: '18U', // will accept categoryName that is valid ageCategoryCode
      ageMax: 20,
      ageMin: 19,
    },
    expectation: {
      errors: ['Invalid submitted ageMin: 19', 'Invalid submitted ageMax: 20'],
      consideredDate: '2023-10-26',
      ageMinDate: '2004-10-27',
      ageMax: 18,
    },
  },
  {
    category: {
      categoryName: 'U18', // will accept categoryName that is valid ageCategoryCode
      ageMax: 20,
      ageMin: 19,
    },
    expectation: {
      errors: ['Invalid submitted ageMax: 20', 'Invalid submitted ageMin: 19'],
      consideredDate: '2023-10-26',
      ageMaxDate: '2004-10-30',
      ageMinDate: '2005-10-27',
      ageMax: 17,
    },
  },
  {
    category: {
      ageMax: 13,
      ageMin: 1,
    },
    expectation: {
      consideredDate: '2023-10-26',
      ageMaxDate: '2022-10-25',
      ageMinDate: '2009-10-27',
      ageMax: 13,
      ageMin: 1,
    },
  },
  {
    category: {
      ageMax: 17,
      ageMin: 9,
    },
    expectation: {
      consideredDate: '2023-10-26',
      ageMaxDate: '2014-10-25',
      ageMinDate: '2005-10-27',
      ageMax: 17,
      ageMin: 9,
    },
  },
  {
    expectation: { consideredDate: '2023-10-26', ageMinDate: '2018-06-06' },
    category: { ageCategoryCode: 'OPEN', ageMinDate: '2018-06-06' },
  },
  {
    expectation: { consideredDate: '2023-10-26' },
    category: { ageCategoryCode: 'OPEN' },
  },
  {
    category: { categoryName: 'C50-70', ageMin: 10, ageMax: 60 },
    expectation: {
      consideredDate: '2023-10-26',
      ageMaxDate: '2013-10-25',
      ageMinDate: '1962-10-27',
      combinedAge: true,
      ageMax: 70,
      ageMin: 50,
    },
  },
  {
    category: { ageCategoryCode: 'U18-10O' },
    expectation: {
      consideredDate: '2023-10-26',
      ageMaxDate: '2012-10-25',
      ageMinDate: '2005-10-27',
      ageMax: 17,
      ageMin: 10,
    },
  },
  {
    category: { ageCategoryCode: '10O-18U' },
    expectation: {
      consideredDate: '2023-10-26',
      ageMaxDate: '2012-10-25',
      ageMinDate: '2004-10-27',
      ageMax: 18,
      ageMin: 10,
    },
  },
  {
    category: { ageCategoryCode: '10O-18U', ageMin: 9 },
    expectation: {
      errors: ['Invalid submitted ageMin: 9'],
      consideredDate: '2023-10-26',
      ageMaxDate: '2012-10-25',
      ageMinDate: '2004-10-27',
      ageMax: 18,
      ageMin: 10,
    },
  },
];

it.each(scenarios.slice(0))(
  'can parse ageCategoryCodes',
  ({ category, expectation }) => {
    const result = getCategoryAgeDetails({ category, consideredDate });
    if (expectation) {
      expect(result).toEqual(expectation);
    } else {
      console.log({ category, expectation: result });
    }
  }
);
