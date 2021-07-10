import { deleteVenue as competitionEngineDeleteVenue } from '../../../competitionEngine/governors/competitionsGovernor/venueManagement/deleteVenue';
import { modifyVenue as competitionEngineModifyVenue } from '../../../competitionEngine/governors/competitionsGovernor/venueManagement/modifyVenue';
import { deleteVenue as tournamentEngineDeleteVenue } from '../../governors/venueGovernor/deleteVenue';
import { modifyVenue as tournamentEngineModifyVenue } from '../../governors/venueGovernor/modifyVenue';
import { tournamentEngine } from '../../sync';

import {
  COURT_NOT_FOUND,
  INVALID_DATE_AVAILABILITY,
  MISSING_COURT_ID,
  MISSING_DATE_AVAILABILITY,
  MISSING_TOURNAMENT_RECORD,
  MISSING_TOURNAMENT_RECORDS,
  VENUE_NOT_FOUND,
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
  expect(result.error).not.toBeUndefined();

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

  const courtId = 'b9df6177-e430-4a70-ba47-9b9ff60258cb';
  modifications = {
    venueName,
    venueAbbreviation,
    courts: [
      {
        courtId,
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

  result = tournamentEngine.modifyCourtAvailability();
  expect(result.error).toEqual(MISSING_COURT_ID);
  result = tournamentEngine.modifyCourtAvailability({ courtId: 'someId' });
  expect(result.error).toEqual(MISSING_DATE_AVAILABILITY);
  result = tournamentEngine.modifyCourtAvailability({
    courtId: 'someId',
    dateAvailability: [],
  });
  expect(result.error).toEqual(COURT_NOT_FOUND);
  result = tournamentEngine.modifyCourtAvailability({
    courtId,
    dateAvailability: [{ foo: 'foo' }],
  });
  expect(result.error).toEqual(INVALID_DATE_AVAILABILITY);
});

test('miscellaneous items for coverage', () => {
  let result = tournamentEngineDeleteVenue({});
  expect(result.error).toEqual(MISSING_TOURNAMENT_RECORD);

  result = competitionEngineDeleteVenue({});
  expect(result.error).toEqual(MISSING_TOURNAMENT_RECORDS);
  result = competitionEngineDeleteVenue({
    tournamentRecords: {},
    venueId: '12345',
  });
  expect(result.error).toEqual(VENUE_NOT_FOUND);

  result = tournamentEngineModifyVenue({});
  expect(result.error).toEqual(MISSING_TOURNAMENT_RECORD);

  result = competitionEngineModifyVenue({});
  expect(result.error).toEqual(MISSING_TOURNAMENT_RECORDS);
});
