import { validDateAvailability } from '../../governors/venueGovernor/dateAvailability';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it, test } from 'vitest';

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

it('can add events, venues, and schedule matchUps', () => {
  const startDate = '2023-01-01';
  const endDate = '2023-01-06';

  const dateAvailability = [
    {
      date: startDate,
      startTime: '07:00',
      endTime: '19:00',
      bookings: [
        { startTime: '07:00', endTime: '08:30', bookingType: 'PRACTICE' },
        { startTime: '08:30', endTime: '09:00', bookingType: 'MAINTENANCE' },
        { startTime: '13:30', endTime: '14:00', bookingType: 'MAINTENANCE' },
      ],
    },
  ];
  const venueProfiles = [
    {
      venueName: 'venue 1',
      dateAvailability,
      courtsCount: 3,
    },
  ];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    venueProfiles,
    startDate,
    endDate,
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  let { courts } = tournamentEngine.getCourts();
  expect(courts.length).toEqual(3);
  const courtId = courts[0].courtId;

  result = tournamentEngine.modifyCourtAvailability({
    dateAvailability: [
      { date: '2022-02-02', startTime: '10:00', endTime: '20:00' },
      { date: '2022-02-02', startTime: '08:00', endTime: '09:00' },
    ],
    courtId,
  });
  expect(result.success).toEqual(true);
  expect(result.totalMergeCount).toEqual(0);

  result = tournamentEngine.modifyCourtAvailability({
    dateAvailability: [
      { date: '2022-02-02', startTime: '08:30', endTime: '20:00' },
      { date: '2022-02-02', startTime: '08:00', endTime: '09:00' },
    ],
    courtId,
  });
  expect(result.success).toEqual(true);
  expect(result.totalMergeCount).toEqual(1);

  courts = tournamentEngine.getCourts().courts;
  const court = courts.find((court) => court.courtId === courtId);

  // overlapping dateAvailability has been merged
  expect(court.dateAvailability).toEqual([
    { date: '2022-02-02', startTime: '08:00', endTime: '20:00' },
  ]);
});
