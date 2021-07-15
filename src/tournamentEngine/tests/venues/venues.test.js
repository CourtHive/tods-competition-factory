import { tournamentEngine } from '../../sync';

it('can define a new venue', () => {
  let result = tournamentEngine.newTournamentRecord();
  expect(result.success).toEqual(true);

  const myCourts = { venueName: 'My Courts' };
  result = tournamentEngine
    .devContext({ addVenue: true })
    .addVenue({ venue: myCourts });
  const {
    venue: { venueId },
  } = result;
  expect(result.success).toEqual(true);

  const initialCourtName = 'Grand Stand';
  const firstCourt = { courtName: initialCourtName };
  result = tournamentEngine.addCourt({ venueId, court: firstCourt });
  expect(result.court.courtName).toEqual(initialCourtName);

  const dateAvailability = [
    {
      date: '2020-01-01T00:00',
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
    venueId,
    courtsCount: 3,
    dateAvailability,
  });
  expect(result.courts.length).toEqual(3);

  const { courts } = tournamentEngine.getCourts();
  expect(courts.length).toEqual(4);

  const { courtId } = courts[0];
  const courtName = 'Center Court';
  let modifications = { courtName };
  tournamentEngine.modifyCourt({ courtId, modifications });

  const { venue } = tournamentEngine.findVenue({ venueId });
  expect(venue.courts.length).toEqual(4);
  expect(venue.courts[0].courtName).toEqual(courtName);
  expect(venue.courts[0].dateAvailability).toEqual([]);
  expect(venue.courts[1].dateAvailability[0].date).toEqual(
    dateAvailability[0].date.split('T')[0]
  );

  const { tournamentRecord } = tournamentEngine.getState();
  expect(tournamentRecord.venues.length).toEqual(1);

  const venueName = 'Grassy Greens';
  modifications = { venueName };
  result = tournamentEngine.modifyVenue({ venueId, modifications });
  expect(result.venue.venueName).toEqual(venueName);
});
