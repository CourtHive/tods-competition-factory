import { tournamentEngine } from '../../sync';
import {
  INVALID_DATE,
  INVALID_TIME,
} from '../../../constants/errorConditionConstants';

it('can define and modify a venue', () => {
  let result = tournamentEngine.newTournamentRecord();
  expect(result.success).toEqual(true);

  const myCourts = { venueName: 'My Courts' };
  result = tournamentEngine.devContext(true).addVenue({ venue: myCourts });
  const {
    venue: { venueId },
  } = result;
  expect(result.success).toEqual(true);

  const venueName = 'New venue name';
  const venueAbbreviation = 'NVN';
  let modifications = {
    venueName,
    venueAbbreviation,
    courts: [
      {
        courtId: 'b9df6177-e430-4a70-ba47-9b9ff60258cb',
        courtName: 'Custom Court 1',
        dateAvailability: [
          {
            date: '01/01/2021',
            startTime: '04:30 pm',
            endTime: '05:30 pm',
          },
          {
            date: '02/01/2021',
            startTime: '04:30 pm',
            endTime: '04:30 pm',
          },
        ],
      },
    ],
  };

  result = tournamentEngine.modifyVenue({ venueId, modifications });
  expect(result.error.errors.length).toEqual(9);
  expect(result.error.errors[0].error).toEqual(INVALID_DATE);
  expect(result.error.errors[1].error).toEqual(INVALID_TIME);
  expect(result.error.errors[2].error).toEqual(INVALID_TIME);
  expect(result.error.errors[3].error).toEqual(INVALID_TIME);
  expect(result.error.errors[4].error).toEqual(INVALID_DATE);
  expect(result.error.errors[5].error).toEqual(INVALID_TIME);
  expect(result.error.errors[6].error).toEqual(INVALID_TIME);
  expect(result.error.errors[7].error).toEqual(INVALID_TIME);

  modifications = {
    venueName,
    venueAbbreviation,
    courts: [
      {
        courtId: 'b9df6177-e430-4a70-ba47-9b9ff60258cb',
        courtName: 'Custom Court 1',
        dateAvailability: [
          {
            date: '2021-01-01',
            startTime: '16:30',
            endTime: '17:30',
          },
          {
            date: '2021-01-02',
            startTime: '16:30',
            endTime: '17:30',
          },
        ],
      },
      {
        courtId: '886068ac-c176-4cd6-be96-768fa895d0c1',
        courtName: 'Custom Court 2',
        dateAvailability: [
          {
            date: '2021-01-01',
            startTime: '16:30',
            endTime: '17:30',
          },
          {
            date: '2021-01-02',
            startTime: '16:30',
            endTime: '17:30',
          },
        ],
      },
    ],
  };
  result = tournamentEngine.modifyVenue({ venueId, modifications });
  let { venue } = tournamentEngine.findVenue({ venueId });
  expect(venue.venueName).toEqual(venueName);
  expect(venue.venueAbbreviation).toEqual(venueAbbreviation);
  expect(venue.courts.length).toEqual(2);

  modifications = {
    courts: [
      {
        courtId: 'b9df6177-e430-4a70-ba47-9b9ff60258cb',
        courtName: 'Custom Court 1',
        dateAvailability: [
          {
            date: '2021-01-01',
            startTime: '16:30',
            endTime: '17:30',
          },
          {
            date: '2021-01-02',
            startTime: '16:30',
            endTime: '17:30',
          },
        ],
      },
    ],
  };

  result = tournamentEngine.modifyVenue({
    venueId,
    modifications,
  });
  ({ venue } = tournamentEngine.findVenue({ venueId }));
  expect(result.venue.courts.length).toEqual(1);
  expect(result.venue.courts[0].dateAvailability.length).toEqual(2);

  modifications = {
    courts: [
      {
        courtId: 'b9df6177-e430-4a70-ba47-9b9ff60258cb',
        courtName: 'Custom Court 1',
        dateAvailability: [
          {
            date: '2021-01-01',
            startTime: '16:30',
            endTime: '17:30',
          },
          {
            date: '2021-01-02',
            startTime: '16:30',
            endTime: '17:30',
          },
          {
            date: '2021-01-03',
            startTime: '16:30',
            endTime: '17:30',
          },
        ],
      },
    ],
  };

  result = tournamentEngine.modifyVenue({
    venueId,
    modifications,
  });
  ({ venue } = tournamentEngine.findVenue({ venueId }));
  expect(result.venue.courts.length).toEqual(1);
  expect(result.venue.courts[0].dateAvailability.length).toEqual(3);

  modifications = {
    courts: [
      {
        courtId: 'b9df6177-e430-4a70-ba47-9b9ff60258cb',
        courtName: 'Custom Court 1',
        dateAvailability: [
          {
            date: '2021-01-01',
            startTime: '08:30',
            endTime: '12:30',
          },
          {
            date: '2021-01-01',
            startTime: '13:30',
            endTime: '15:30',
          },
          {
            date: '2021-01-01',
            startTime: '16:30',
            endTime: '18:30',
          },
        ],
      },
    ],
  };

  result = tournamentEngine.modifyVenue({
    venueId,
    modifications,
  });
  ({ venue } = tournamentEngine.findVenue({ venueId }));
  expect(result.venue.courts.length).toEqual(1);
  expect(result.venue.courts[0].dateAvailability.length).toEqual(3);

  result = tournamentEngine.modifyVenue({
    venueId,
    modifications,
    force: true,
  });
  ({ venue } = tournamentEngine.findVenue({ venueId }));
  expect(venue.courts.length).toEqual(1);

  modifications = {
    venueName,
    venueAbbreviation,
    courts: [
      {
        courtId: 'b9df6177-e430-4a70-ba47-9b9ff60258cb',
        courtName: 'Custom Court 1',
        dateAvailability: [
          {
            date: '2021-01-01',
            startTime: '16:30',
            endTime: '17:30',
          },
          {
            date: '2021-01-02',
            startTime: '16:30',
            endTime: '17:30',
          },
        ],
      },
      {
        courtId: '886068ac-c176-4cd6-be96-768fa895d0c1',
        courtName: 'Custom Court 2',
        dateAvailability: [
          {
            date: '2021-01-01',
            startTime: '16:30',
            endTime: '17:30',
          },
          {
            date: '2021-01-02',
            startTime: '16:30',
            endTime: '17:30',
          },
        ],
      },
    ],
  };
  result = tournamentEngine.modifyVenue({ venueId, modifications });
  ({ venue } = tournamentEngine.findVenue({ venueId }));
  expect(venue.venueName).toEqual(venueName);
  expect(venue.venueAbbreviation).toEqual(venueAbbreviation);
  expect(venue.courts.length).toEqual(2);
});
