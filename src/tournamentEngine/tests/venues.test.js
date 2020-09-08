import { tournamentEngine } from '../../tournamentEngine';

it('can define a new venue', () => {
  let result = tournamentEngine.newTournamentRecord();
  expect(result.success).toEqual(true);

  let myCourts = { venueName: 'My Courts' }
  result = tournamentEngine.addVenue({venue: myCourts});
  let { venue: { venueId } } = result;
  expect(result.success).toEqual(true);

  let firstCourt = { courtName: '1' };
  result = tournamentEngine.addCourt({venueId, court: firstCourt});

  const dateAvailability = [
    {
      date: '2020-01-01', startTime: '07:00', endTime: '19:00',
      bookings: [
        { startTime: '7:00', endTime: '8:30', bookingType: 'PRACTICE'},
        { startTime: '8:30', endTime: '9:00', bookingType: 'MAINTENANCE'},
        { startTime: '13:30', endTime: '14:00', bookingType: 'MAINTENANCE'}
      ]
    }
  ];
  result = tournamentEngine.addCourts({venueId, courtsCount: 3, dateAvailability});
  expect(result.courts.length).toEqual(3);

  let { venue } = tournamentEngine.findVenue({venueId});
  expect(venue.courts.length).toEqual(4);
  expect(venue.courts[0].dateAvailability).toEqual([]);
  expect(venue.courts[1].dateAvailability).toEqual(dateAvailability);
});
