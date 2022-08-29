import { addDays, dateRange } from '../../../../utilities/dateTime';
import { chunkArray } from '../../../../utilities';
import mocksEngine from '../../../../mocksEngine';
import competitionEngine from '../../../sync';
import tournamentEngine from '../../../../tournamentEngine/sync';
import { expect } from 'vitest';

it('supports pro-scheduling', () => {
  const startDate = '2022-08-27'; // date on which first pro scheduling was first successfully run
  const endDate = addDays(startDate, 3);
  const {
    venueIds: [venueId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    venueProfiles: [{ courtsCount: 6 }],
    drawProfiles: [{ drawSize: 32 }],
    startDate,
    endDate,
  });

  competitionEngine.setState(tournamentRecord);

  const tournamentDateRange = dateRange(startDate, endDate);
  const { rounds } = competitionEngine.getRounds();
  const roundChunks = chunkArray(rounds, 2);

  const schedulingProfile = roundChunks.map((chunk, i) => ({
    scheduleDate: tournamentDateRange[i],
    venues: [{ venueId, rounds: chunk }],
  }));
  let result = competitionEngine.setSchedulingProfile({ schedulingProfile });
  expect(result.success).toEqual(true);

  result = competitionEngine.scheduleProfileRounds({ pro: true });
  expect(result.success).toEqual(true);

  const { matchUps } = competitionEngine.allCompetitionMatchUps();
  const roundSchedules = matchUps.map(
    ({ schedule: { scheduledTime, courtName }, roundNumber }) => [
      roundNumber,
      scheduledTime,
      courtName,
    ]
  );

  // no recovery time has been defined and the default averageMatchUpTime is 90 minutes
  expect(roundSchedules).toEqual([
    [1, '2022-08-27T07:00', 'Court 1'], // rounds 1 & 2 are scheduled for the 1st day
    [1, '2022-08-27T07:00', 'Court 2'],
    [1, '2022-08-27T07:00', 'Court 3'],
    [1, '2022-08-27T07:00', 'Court 4'],
    [1, '2022-08-27T07:00', 'Court 5'],
    [1, '2022-08-27T07:00', 'Court 6'],
    [1, '2022-08-27T08:30', 'Court 1'],
    [1, '2022-08-27T08:30', 'Court 2'],
    [1, '2022-08-27T08:30', 'Court 3'],
    [1, '2022-08-27T08:30', 'Court 4'],
    [1, '2022-08-27T08:30', 'Court 5'],
    [1, '2022-08-27T08:30', 'Court 6'],
    [1, '2022-08-27T10:00', 'Court 1'],
    [1, '2022-08-27T10:00', 'Court 2'],
    [1, '2022-08-27T10:00', 'Court 3'],
    [1, '2022-08-27T10:00', 'Court 4'],
    [2, '2022-08-27T10:00', 'Court 5'],
    [2, '2022-08-27T10:00', 'Court 6'],
    [2, '2022-08-27T11:30', 'Court 1'],
    [2, '2022-08-27T11:30', 'Court 2'],
    [2, '2022-08-27T11:30', 'Court 3'],
    [2, '2022-08-27T11:30', 'Court 4'],
    [2, '2022-08-27T11:30', 'Court 5'],
    [2, '2022-08-27T11:30', 'Court 6'],
    [3, '2022-08-28T07:00', 'Court 1'], // rounds 3 & 4 are scheduled for the 2nd day
    [3, '2022-08-28T07:00', 'Court 2'],
    [3, '2022-08-28T07:00', 'Court 3'],
    [3, '2022-08-28T07:00', 'Court 4'],
    [4, '2022-08-28T08:30', 'Court 1'],
    [4, '2022-08-28T08:30', 'Court 2'],
    [5, '2022-08-29T07:00', 'Court 1'], // round 5 is scheduled for the 3rd day
  ]);
});

it('pro-scheduling respects DO_NOT_SCHEDULE requests', () => {
  tournamentEngine.reset();
  competitionEngine.reset();

  const availableDates = ['2022-01-01'];

  tournamentEngine.newTournamentRecord({
    tournamentName: 'New Tournament',
  });

  const {
    venue: { venueId },
  } = tournamentEngine.addVenue({
    venue: { venueName: 'test Tennis', venueAbbreviation: 'Test' },
    returnDetails: true,
  });

  const dateAvailability = availableDates.map((date) => ({
    date: date,
    startTime: '08:00',
    endTime: '22:00',
  }));

  tournamentEngine.addCourts({
    courtNames: ['1'],
    courtsCount: 1,
    venueId,
    dateAvailability: dateAvailability,
  });

  const generatePersons = (length) => {
    return [...new Array(length)].map((_, index) => {
      return {
        personId: index,
        standardFamilyName: 'test',
        standardGivenName: 'test',
        nationalityCode: 'BRA',
        sex: 'MALE',
      };
    });
  };

  const persons = generatePersons(3);
  tournamentEngine.addPersons({ persons });

  // add a DO_NOT_SCHEDULE for the first person

  const requests = [
    {
      date: availableDates[0],
      startTime: '07:00',
      endTime: '12:00',
      requestType: 'DO_NOT_SCHEDULE',
    },
  ];

  competitionEngine.addPersonRequests({
    personId: persons[0].personId,
    requests,
  });

  const event = {
    eventName: 'Test Event',
    eventType: 'SINGLES',
    eventGender: 'MALE',
  };

  let { tournamentRecord } = tournamentEngine.getState();
  const { participants } = tournamentRecord;
  const participantsIds = participants.map(
    (participant) => participant.participantId
  );

  const {
    event: { eventId },
  } = tournamentEngine.addEvent({ event });

  tournamentEngine.setEventDates({
    eventId,
    startDate: availableDates[0],
    endDate: availableDates[availableDates.length - 1],
  });

  tournamentEngine.addEventEntries({
    eventId,
    participantIds: participantsIds,
  });

  tournamentEngine.generateDrawDefinition({
    eventId: eventId,
    addToEvent: true,
  });

  competitionEngine.clearScheduledMatchUps();
  const { rounds } = tournamentEngine.getRounds();

  const schedulingProfile = [
    {
      scheduleDate: availableDates[0],
      venues: [{ venueId, rounds }],
    },
  ];

  let result = competitionEngine.setSchedulingProfile({ schedulingProfile });

  result = competitionEngine.scheduleProfileRounds({
    pro: true,
    scheduleDates: availableDates,
  });

  expect(result.success).toEqual(true);
  expect(result.noTimeMatchUpIds[availableDates[0]]).toEqual([]);

  const { matchUps } = competitionEngine.allCompetitionMatchUps();
  const roundSchedules = matchUps.map(
    ({ schedule: { scheduledTime, courtName }, roundNumber }) => [
      roundNumber,
      scheduledTime,
      courtName,
    ]
  );

  expect(roundSchedules).toStrictEqual([
    [1, '2022-01-01T08:00', '1'],
    [2, '2022-01-01T09:30', '1'],
  ]);
});
