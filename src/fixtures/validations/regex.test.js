import {
  dateValidation,
  timeValidation,
  validDateString,
  validTimeString,
} from './regex';

it('can validate date strings', () => {
  expect(validDateString.test()).toEqual(false);
  expect(validDateString.test('')).toEqual(false);
  expect(validDateString.test('2020')).toEqual(false);
  expect(validDateString.test('2020-01')).toEqual(false);
  expect(validDateString.test('2020-01-01')).toEqual(true);
  expect(validDateString.test('2020-01-01T')).toEqual(false);
  expect(validDateString.test('2020-01-01T00:00')).toEqual(false);
  expect(validDateString.test('2020-01-01 00:00')).toEqual(false);
  expect(validDateString.test('2020-01-01X00:00')).toEqual(false);
  expect(validDateString.test('2020-01-01T00:00:00')).toEqual(false);
  expect(validDateString.test('2020-01-01 00:00:00')).toEqual(false);
  expect(validDateString.test('2020-01-01T08:05:00Z')).toEqual(false);

  expect(validDateString.test('2020-13-01')).toEqual(false);
  expect(validDateString.test('2020-12-31')).toEqual(true);
  expect(validDateString.test('2020-12-32')).toEqual(false);
});

it('can validate iso date strings', () => {
  expect(dateValidation.test()).toEqual(false);
  expect(dateValidation.test('')).toEqual(false);
  expect(dateValidation.test('2020')).toEqual(false);
  expect(dateValidation.test('2020-01')).toEqual(false);
  expect(dateValidation.test('2020-01-01')).toEqual(true);
  expect(dateValidation.test('2020-01-01T')).toEqual(false);
  expect(dateValidation.test('2020-01-01T00:00')).toEqual(true);
  expect(dateValidation.test('2020-01-01 00:00')).toEqual(true);
  expect(dateValidation.test('2020-01-01X00:00')).toEqual(false);
  expect(dateValidation.test('2020-01-01T00:00:00')).toEqual(true);
  expect(dateValidation.test('2020-01-01 00:00:00')).toEqual(true);
  expect(dateValidation.test('2020-01-01T08:05:00Z')).toEqual(true);

  expect(dateValidation.test('2020-13-01')).toEqual(false);
  expect(dateValidation.test('2020-12-31')).toEqual(true);
  expect(dateValidation.test('2020-12-32')).toEqual(false);
});

it('can validate time strings as part of date strings', () => {
  expect(timeValidation.test('2020-01-01T08:05:00Z')).toEqual(true);
  expect(timeValidation.test('2020-01-01T08:05:00Z')).toEqual(true);
  expect(timeValidation.test('2020-01-01T08:05:00X')).toEqual(false);
  expect(timeValidation.test('2020-01-01T08:05')).toEqual(true);
  expect(timeValidation.test('2020-01-01T13:05')).toEqual(true);
  expect(timeValidation.test('2020-01-01T23:05')).toEqual(true);
  expect(timeValidation.test('2020-01-01T23:59')).toEqual(true);
  expect(timeValidation.test('2020-01-01T23:69')).toEqual(false);
  expect(timeValidation.test('2020-01-01T24:05')).toEqual(false);
  expect(timeValidation.test('2020-01-01T09:05:00Z')).toEqual(true);

  expect(timeValidation.test('08:00:00')).toEqual(true);
  expect(timeValidation.test('08:00:59')).toEqual(true);
  expect(timeValidation.test('08:00:60')).toEqual(false);
});

it('can validate time strings', () => {
  expect(validTimeString.test()).toEqual(false);
  expect(validTimeString.test('')).toEqual(false);
  expect(validTimeString.test('2020-01-01T08:05:00Z')).toEqual(false);
  expect(validTimeString.test('08:05:00Z')).toEqual(false);
  expect(validTimeString.test('08:05:00X')).toEqual(false);
  expect(validTimeString.test('08:05')).toEqual(true);
  expect(validTimeString.test('13:05')).toEqual(true);
  expect(validTimeString.test('23:05')).toEqual(true);
  expect(validTimeString.test('23:59')).toEqual(true);
  expect(validTimeString.test('23:69')).toEqual(false);
  expect(validTimeString.test('24:05')).toEqual(false);

  expect(validTimeString.test('08:00:00')).toEqual(true);
  expect(validTimeString.test('08:00:59')).toEqual(true);
  expect(validTimeString.test('08:00:60')).toEqual(false);
});
