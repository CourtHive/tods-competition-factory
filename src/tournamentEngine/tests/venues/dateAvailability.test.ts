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

const invalidTime = 'Invalid Time';
const d210102 = '2021-01-02';
const d220202 = '2022-02-02';

test('will not allow saving of Invalid Date in dateAvailability', () => {
  let dateAvailability: any = [
    { date: d210102, startTime: '09:00', endTime: '16:00' },
  ];
  let result = validDateAvailability({ dateAvailability });
  expect(result.valid).toEqual(true);

  result = validDateAvailability({ dateAvailability: 'not an array' });
  expect(result.error).toEqual(INVALID_DATE_AVAILABILITY);

  result = validDateAvailability({ dateAvailability: ['not an object'] });
  expect(result.error).toEqual(INVALID_DATE_AVAILABILITY);

  dateAvailability = [
    { date: invalidTime, startTime: '09:00', endTime: '16:00' },
  ];
  result = validDateAvailability({ dateAvailability });
  expect(result.error).toEqual(INVALID_DATE);

  dateAvailability = [
    { date: d210102, startTime: invalidTime, endTime: '16:00' },
  ];
  result = validDateAvailability({ dateAvailability });
  expect(result.error).toEqual(INVALID_TIME);

  dateAvailability = [
    { date: d210102, startTime: '09:00', endTime: invalidTime },
  ];
  result = validDateAvailability({ dateAvailability });
  expect(result.error).toEqual(INVALID_TIME);

  dateAvailability = [{ date: d210102, startTime: '09:00', endTime: '09:00' }];
  result = validDateAvailability({ dateAvailability });
  expect(result.error).toEqual(INVALID_TIME);

  dateAvailability = [{ date: d210102, startTime: '10:00', endTime: '09:00' }];
  result = validDateAvailability({ dateAvailability });
  expect(result.error).toEqual(INVALID_TIME);

  dateAvailability = [
    {
      bookings: [{ startTime: '09:00', endTime: '10:00' }],
      startTime: '08:00',
      endTime: '19:00',
      date: d210102,
    },
  ];
  result = validDateAvailability({ dateAvailability });
  expect(result.valid).toEqual(true);

  dateAvailability = [
    {
      bookings: 'not an array',
      startTime: '08:00',
      endTime: '19:00',
      date: d210102,
    },
  ];
  result = validDateAvailability({ dateAvailability });
  expect(result.error).toEqual(INVALID_BOOKINGS);

  dateAvailability = [
    {
      bookings: ['not an object'],
      startTime: '08:00',
      endTime: '19:00',
      date: d210102,
    },
  ];
  result = validDateAvailability({ dateAvailability });
  expect(result.error).toEqual(INVALID_BOOKINGS);

  dateAvailability = [
    {
      bookings: [{ startTime: invalidTime, endTime: '10:00' }],
      startTime: '08:00',
      endTime: '19:00',
      date: d210102,
    },
  ];
  result = validDateAvailability({ dateAvailability });
  expect(result.error).toEqual(INVALID_TIME);

  dateAvailability = [
    {
      bookings: [{ startTime: '09:00', endTime: invalidTime }],
      startTime: '08:00',
      endTime: '19:00',
      date: d210102,
    },
  ];
  result = validDateAvailability({ dateAvailability });
  expect(result.error).toEqual(INVALID_TIME);

  dateAvailability = [
    {
      bookings: [{ startTime: '09:00', endTime: '09:00' }],
      startTime: '08:00',
      endTime: '19:00',
      date: d210102,
    },
  ];
  result = validDateAvailability({ dateAvailability });
  expect(result.error).toEqual(INVALID_TIME);

  dateAvailability = [
    {
      bookings: [{ startTime: '10:00', endTime: '09:00' }],
      startTime: '08:00',
      endTime: '19:00',
      date: d210102,
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
      startTime: '07:00',
      endTime: '19:00',
      date: startDate,
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
      { date: d220202, startTime: '10:00', endTime: '20:00' },
      { date: d220202, startTime: '08:00', endTime: '09:00' },
    ],
    courtId,
  });
  expect(result.success).toEqual(true);
  expect(result.totalMergeCount).toEqual(0);

  result = tournamentEngine.modifyCourtAvailability({
    dateAvailability: [
      { date: d220202, startTime: '08:30', endTime: '20:00' },
      { date: d220202, startTime: '08:00', endTime: '09:00' },
    ],
    courtId,
  });
  expect(result.success).toEqual(true);
  expect(result.totalMergeCount).toEqual(1);

  courts = tournamentEngine.getCourts().courts;
  const court = courts.find((court) => court.courtId === courtId);

  // overlapping dateAvailability has been merged
  expect(court.dateAvailability).toEqual([
    { date: d220202, startTime: '08:00', endTime: '20:00' },
  ]);
});
