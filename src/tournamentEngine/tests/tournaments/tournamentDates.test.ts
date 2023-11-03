import { expect, it } from 'vitest';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

it('will remove court.dateAvailabiilty items that fall outside of tournament dates', () => {
  const venueId = 'venueId';
  const venue = {
    venueName: 'City Courts',
    venueAbbreviation: 'CC',
    venueId,
    courts: [
      {
        courtName: 'Court 1',
        dateAvailability: [
          {
            startTime: '18:00',
            endTime: '22:00',
          },
          {
            date: '2022-09-24T00:00:00.000Z',
            startTime: '08:00',
            endTime: '18:00',
          },
          {
            date: '2022-09-25T00:00:00.000Z',
            startTime: '08:00',
            endTime: '18:00',
          },
          {
            date: '2022-09-26T00:00:00.000Z',
            startTime: '18:00',
            endTime: '22:00',
          },
          {
            date: '2022-09-27T00:00:00.000Z',
            startTime: '18:00',
            endTime: '22:00',
          },
          {
            date: '2022-09-28T00:00:00.000Z',
            startTime: '18:00',
            endTime: '22:00',
          },
        ],
        onlineResources: [],
      },
    ],
  };
  const startDate = '2022-09-24T00:00:00.000Z';
  const endDate = '2022-09-28T00:00:00.000Z';

  const drawSize = 2;
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize }],
    startDate,
    endDate,
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);
  result = tournamentEngine.addVenue({ venue });
  expect(result.success).toEqual(true);

  result = tournamentEngine.findVenue({ venueId });
  expect(result.venue.courts[0].dateAvailability.length).toEqual(6);

  result = tournamentEngine.setTournamentDates({ startDate: '2022-09-26' });
  expect(result.success).toEqual(true);

  result = tournamentEngine.findVenue({ venueId });
  expect(result.venue.courts[0].dateAvailability.length).toEqual(4);

  result = tournamentEngine.setTournamentDates({ endDate: '2022-09-27' });
  expect(result.success).toEqual(true);

  result = tournamentEngine.findVenue({ venueId });
  expect(result.venue.courts[0].dateAvailability.length).toEqual(3);
});
