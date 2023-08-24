import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import { ROUND_ROBIN } from '../../../constants/drawDefinitionConstants';

it('can return all event data', () => {
  const drawProfiles = [
    { drawSize: 32 },
    { drawSize: 16, drawType: ROUND_ROBIN },
  ];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    startDate: '2021-01-01',
    endDate: '2021-01-01',
    drawProfiles,
  });

  const myCourts = { venueName: 'My Courts' };
  let result = tournamentEngine
    .setState(tournamentRecord)
    .devContext({ addVenue: true })
    .addVenue({ venue: myCourts });
  const {
    venue: { venueId },
  } = result;
  expect(result.success).toEqual(true);

  const date = '2020-01-01T00:00';
  const dateAvailability = [
    {
      date,
      startTime: '07:00',
      endTime: '19:00',
      bookings: [
        { startTime: '07:00', endTime: '08:30', bookingType: 'PRACTICE' },
        { startTime: '08:30', endTime: '09:00', bookingType: 'MAINTENANCE' },
        { startTime: '13:30', endTime: '14:00', bookingType: 'MAINTENANCE' },
      ],
    },
  ];
  result = tournamentEngine.addCourts({
    dateAvailability,
    courtsCount: 3,
    venueId,
  });

  expect(result.success).toEqual(true);

  const {
    allEventData: { tournamentInfo, eventsData, venuesData },
  } = tournamentEngine.getAllEventData();
  expect(tournamentInfo).not.toBeUndefined();
  expect(eventsData).not.toBeUndefined();
  expect(venuesData).not.toBeUndefined();
});
