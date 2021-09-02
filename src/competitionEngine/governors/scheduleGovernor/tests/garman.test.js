import { generateRange } from '../../../../utilities';
import garman from '../garman/garman';

const date = new Date().toISOString().split('T')[0];

function courtGenerator({
  count = 10,
  startTime = '8:00',
  endTime = '20:30',
} = {}) {
  return generateRange(0, count).map(() => ({
    dateAvailability: [{ date, startTime, endTime }],
  }));
}

it('generates dummy courts', () => {
  let courts = courtGenerator({
    count: 10,
    startTime: '8:00',
    endTime: '20:30',
  });
  expect(courts.length).toEqual(10);
  expect(courts[9].dateAvailability[0].startTime).toEqual('8:00');
  expect(courts[9].dateAvailability[0].endTime).toEqual('20:30');
  courts = courtGenerator({ count: 12, startTime: '7:00', endTime: '18:00' });
  expect(courts[11].dateAvailability[0].startTime).toEqual('7:00');
  expect(courts[11].dateAvailability[0].endTime).toEqual('18:00');
});

it('replcates revised garman spreadsheet funcationality', () => {
  let courts = courtGenerator({
    count: 10,
    startTime: '8:00',
    endTime: '20:30',
  });
  let { timingProfile } = garman.getScheduleTimes({
    startTime: '8:00',
    endTime: '19:00',
    date,
    periodLength: 30,
    averageMatchUpMinutes: 90,
    courts,
  });
  expect(timingProfile.length).toEqual(23);
  expect(timingProfile[21].add).toEqual(3);
  expect(timingProfile[22].add).toEqual(4);
  expect(timingProfile[22].totalMatchUps).toEqual(80);

  courts = courtGenerator({ count: 12, startTime: '8:00', endTime: '20:30' });
  ({ timingProfile } = garman.getScheduleTimes({
    startTime: '8:00',
    endTime: '19:00',
    date,
    periodLength: 30,
    averageMatchUpMinutes: 80,
    courts,
  }));
  expect(timingProfile[21].add).toEqual(5);
  expect(timingProfile[22].add).toEqual(4);
  expect(timingProfile[22].totalMatchUps).toEqual(106);

  courts = courtGenerator({ count: 3, startTime: '8:00', endTime: '20:30' });
  ({ timingProfile } = garman.getScheduleTimes({
    startTime: '8:00',
    endTime: '19:00',
    date,
    periodLength: 30,
    averageMatchUpMinutes: 75,
    courts,
  }));
  expect(timingProfile[21].add).toEqual(2);
  expect(timingProfile[22].add).toEqual(1);
  expect(timingProfile[22].totalMatchUps).toEqual(28);
});

it('correctly determines courts available at periodStart', () => {
  const courts = [
    {
      courtId: 0,
      dateAvailability: [{ date, startTime: '9:00', endTime: '17:00' }],
    },
    {
      courtId: 1,
      dateAvailability: [{ date, startTime: '9:00', endTime: '17:00' }],
    },
    {
      courtId: 2,
      dateAvailability: [{ date, startTime: '11:00', endTime: '18:00' }],
    },
    {
      courtId: 3,
      dateAvailability: [{ date, startTime: '11:00', endTime: '18:00' }],
    },
  ];

  let availability = garman.courtsAvailableAtPeriodStart({
    courts,
    date,
    periodStart: '8:00',
    averageMatchUpMinutes: 90,
  });
  expect(availability.availableToScheduleCount).toEqual(0);
  availability = garman.courtsAvailableAtPeriodStart({
    courts,
    date,
    periodStart: '9:00',
    averageMatchUpMinutes: 90,
  });
  expect(availability.availableToScheduleCount).toEqual(2);
  availability = garman.courtsAvailableAtPeriodStart({
    courts,
    date,
    periodStart: '11:00',
    averageMatchUpMinutes: 90,
  });
  expect(availability.availableToScheduleCount).toEqual(4);
  availability = garman.courtsAvailableAtPeriodStart({
    courts,
    date,
    periodStart: '15:30',
    averageMatchUpMinutes: 90,
  });
  expect(availability.availableToScheduleCount).toEqual(4);
  availability = garman.courtsAvailableAtPeriodStart({
    courts,
    date,
    periodStart: '15:31',
    averageMatchUpMinutes: 90,
  });
  expect(availability.availableToScheduleCount).toEqual(2);
  availability = garman.courtsAvailableAtPeriodStart({
    courts,
    date,
    periodStart: '16:30',
    averageMatchUpMinutes: 90,
  });
  expect(availability.availableToScheduleCount).toEqual(2);
  availability = garman.courtsAvailableAtPeriodStart({
    courts,
    date,
    periodStart: '16:31',
    averageMatchUpMinutes: 90,
  });
  expect(availability.availableToScheduleCount).toEqual(0);
});

it('generates expected output for two locations with differing court availability', () => {
  const courts = [
    { dateAvailability: [{ date, startTime: '9:00', endTime: '17:00' }] },
    { dateAvailability: [{ date, startTime: '9:00', endTime: '17:00' }] },
    { dateAvailability: [{ date, startTime: '11:00', endTime: '18:00' }] },
    { dateAvailability: [{ date, startTime: '11:00', endTime: '18:00' }] },
  ];

  const { timingProfile } = garman.getScheduleTimes({
    startTime: '8:00',
    endTime: '18:00',
    date,
    periodLength: 30,
    averageMatchUpMinutes: 90,
    courts,
  });
  expect(timingProfile[20].add).toEqual(0);
  expect(timingProfile[19].add).toEqual(0);
  expect(timingProfile[18].add).toEqual(0);
  expect(timingProfile[17].add).toEqual(1);
  expect(timingProfile[17].totalMatchUps).toEqual(20);
  expect(timingProfile[20].totalMatchUps).toEqual(20);
});

it('can generate timeSlots from dateAvailability', () => {
  const courtDate = {
    date: '2020-01-01',
    startTime: '9:00',
    endTime: '17:00',
    bookings: [
      { startTime: '8:00', endTime: '9:10', bookingType: 'practice' },
      { startTime: '9:10', endTime: '12:00', bookingType: 'matchUp' },
      { startTime: '12:00', endTime: '13:30', bookingType: 'maintenance' },
      { startTime: '14:00', endTime: '19:10' },
    ],
  };

  const timeSlots = garman.generateTimeSlots({
    courtDate,
    includeBookingTypes: ['matchUp'],
  });
  expect(timeSlots.length).toEqual(2);
  expect(timeSlots[0]).toEqual({ startTime: '09:10', endTime: '12:00' });
  expect(timeSlots[1]).toEqual({ startTime: '13:30', endTime: '14:00' });
});
