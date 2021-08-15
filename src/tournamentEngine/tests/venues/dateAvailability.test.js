import { validDateAvailability } from '../../governors/venueGovernor/dateAvailability';

import {
  INVALID_BOOKINGS,
  INVALID_DATE,
  INVALID_DATE_AVAILABILITY,
  INVALID_TIME,
} from '../../../constants/errorConditionConstants';

test('will not allow saving of Invalid Date in dateAvailability', () => {
  let dateAvailability = [
    { date: '2021-01-02', startTime: '09:00', endTime: '16:00' },
  ];
  let result = validDateAvailability({ dateAvailability });
  expect(result.valid).toEqual(true);

  result = validDateAvailability({ dateAvailability: 'not an array' });
  expect(result.error).toEqual(INVALID_DATE_AVAILABILITY);

  result = validDateAvailability({ dateAvailability: ['not an object'] });
  expect(result.error).toEqual(INVALID_DATE_AVAILABILITY);

  dateAvailability = [
    { date: 'Invalid Date', startTime: '09:00', endTime: '16:00' },
  ];
  result = validDateAvailability({ dateAvailability });
  expect(result.error).toEqual(INVALID_DATE);

  dateAvailability = [
    { date: '2021-01-02', startTime: 'Invalid Time', endTime: '16:00' },
  ];
  result = validDateAvailability({ dateAvailability });
  expect(result.error).toEqual(INVALID_TIME);

  dateAvailability = [
    { date: '2021-01-02', startTime: '09:00', endTime: 'Invalid Time' },
  ];
  result = validDateAvailability({ dateAvailability });
  expect(result.error).toEqual(INVALID_TIME);

  dateAvailability = [
    { date: '2021-01-02', startTime: '09:00', endTime: '09:00' },
  ];
  result = validDateAvailability({ dateAvailability });
  expect(result.error).toEqual(INVALID_TIME);

  dateAvailability = [
    { date: '2021-01-02', startTime: '10:00', endTime: '09:00' },
  ];
  result = validDateAvailability({ dateAvailability });
  expect(result.error).toEqual(INVALID_TIME);

  dateAvailability = [
    {
      date: '2021-01-02',
      startTime: '08:00',
      endTime: '19:00',
      bookings: [{ startTime: '09:00', endTime: '10:00' }],
    },
  ];
  result = validDateAvailability({ dateAvailability });
  expect(result.valid).toEqual(true);

  dateAvailability = [
    {
      date: '2021-01-02',
      startTime: '08:00',
      endTime: '19:00',
      bookings: 'not an array',
    },
  ];
  result = validDateAvailability({ dateAvailability });
  expect(result.error).toEqual(INVALID_BOOKINGS);

  dateAvailability = [
    {
      date: '2021-01-02',
      startTime: '08:00',
      endTime: '19:00',
      bookings: ['not an object'],
    },
  ];
  result = validDateAvailability({ dateAvailability });
  expect(result.error).toEqual(INVALID_BOOKINGS);

  dateAvailability = [
    {
      date: '2021-01-02',
      startTime: '08:00',
      endTime: '19:00',
      bookings: [{ startTime: 'Invalid Time', endTime: '10:00' }],
    },
  ];
  result = validDateAvailability({ dateAvailability });
  expect(result.error).toEqual(INVALID_TIME);

  dateAvailability = [
    {
      date: '2021-01-02',
      startTime: '08:00',
      endTime: '19:00',
      bookings: [{ startTime: '09:00', endTime: 'Invalid Time' }],
    },
  ];
  result = validDateAvailability({ dateAvailability });
  expect(result.error).toEqual(INVALID_TIME);

  dateAvailability = [
    {
      date: '2021-01-02',
      startTime: '08:00',
      endTime: '19:00',
      bookings: [{ startTime: '09:00', endTime: '09:00' }],
    },
  ];
  result = validDateAvailability({ dateAvailability });
  expect(result.error).toEqual(INVALID_TIME);

  dateAvailability = [
    {
      date: '2021-01-02',
      startTime: '08:00',
      endTime: '19:00',
      bookings: [{ startTime: '10:00', endTime: '09:00' }],
    },
  ];
  result = validDateAvailability({ dateAvailability });
  expect(result.error).toEqual(INVALID_TIME);
});
