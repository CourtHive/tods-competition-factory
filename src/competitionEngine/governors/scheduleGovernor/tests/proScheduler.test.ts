import { addDays, dateRange } from '../../../../utilities/dateTime';
import tournamentEngine from '../../../../tournamentEngine/sync';
import { chunkArray } from '../../../../utilities';
import mocksEngine from '../../../../mocksEngine';
import competitionEngine from '../../../sync';
import { expect, it, test } from 'vitest';

import { TO_BE_PLAYED } from '../../../../constants/matchUpStatusConstants';
import { SINGLES_EVENT } from '../../../../constants/eventConstants';
import { MALE } from '../../../../constants/genderConstants';

it('supports pro-scheduling', () => {
  const startDate = '2022-08-27'; // date on which pro scheduling was first successfully run
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
  expect(
    Object.values(result.scheduledMatchUpIds).map((x: any) => x.length)
  ).toEqual([24, 6, 1]);

  let { matchUps } = competitionEngine.allCompetitionMatchUps();
  let roundSchedules = matchUps.map(
    ({ schedule: { scheduledTime, courtName }, roundNumber }) => [
      roundNumber,
      scheduledTime,
      courtName,
    ]
  );

  const times = [
    '2022-08-27T07:00',
    '2022-08-27T08:30',
    '2022-08-27T10:00',
    '2022-08-27T11:30',
    '2022-08-28T07:00',
  ];

  const courtNames = [
    'Court 1',
    'Court 2',
    'Court 3',
    'Court 4',
    'Court 5',
    'Court 6',
  ];

  // no recovery time has been defined and the default averageMatchUpTime is 90 minutes
  const roundScheduleExpectation = [
    [1, times[0], courtNames[0]], // rounds 1 & 2 are scheduled for the 1st day
    [1, times[0], courtNames[1]],
    [1, times[0], courtNames[2]],
    [1, times[0], courtNames[3]],
    [1, times[0], courtNames[4]],
    [1, times[0], courtNames[5]],
    [1, times[1], courtNames[0]],
    [1, times[1], courtNames[1]],
    [1, times[1], courtNames[2]],
    [1, times[1], courtNames[3]],
    [1, times[1], courtNames[4]],
    [1, times[1], courtNames[5]],
    [1, times[2], courtNames[0]],
    [1, times[2], courtNames[1]],
    [1, times[2], courtNames[2]],
    [1, times[2], courtNames[3]],
    [2, times[2], courtNames[4]],
    [2, times[2], courtNames[5]],
    [2, times[3], courtNames[0]],
    [2, times[3], courtNames[1]],
    [2, times[3], courtNames[2]],
    [2, times[3], courtNames[3]],
    [2, times[3], courtNames[4]],
    [2, times[3], courtNames[5]],
    [3, times[4], courtNames[0]], // rounds 3 & 4 are scheduled for the 2nd day
    [3, times[4], courtNames[1]],
    [3, times[4], courtNames[2]],
    [3, times[4], courtNames[3]],
    [4, '2022-08-28T08:30', courtNames[0]],
    [4, '2022-08-28T08:30', courtNames[1]],
    [5, '2022-08-29T07:00', courtNames[0]], // round 5 is scheduled for the 3rd day
  ];

  expect(roundSchedules).toEqual(roundScheduleExpectation);

  result = competitionEngine.scheduleProfileRounds({
    clearScheduleDates: true,
    pro: true,
  });
  expect(result.success).toEqual(true);
  expect(
    Object.values(result.scheduledMatchUpIds).map((x: any) => x.length)
  ).toEqual([24, 6, 1]);

  matchUps = competitionEngine.allCompetitionMatchUps().matchUps;
  roundSchedules = matchUps.map(
    ({ schedule: { scheduledTime, courtName }, roundNumber }) => [
      roundNumber,
      scheduledTime,
      courtName,
    ]
  );

  expect(roundSchedules).toEqual(roundScheduleExpectation);
});

test('pro-scheduling respects DO_NOT_SCHEDULE requests', () => {
  competitionEngine.reset();

  const startDate = '2022-01-01';
  const endDate = '2022-01-01';
  const availableDates = [startDate];

  tournamentEngine.newTournamentRecord({
    tournamentName: 'New Tournament',
    startDate,
    endDate,
  });

  const {
    venue: { venueId },
  } = tournamentEngine.addVenue({
    venue: { venueName: 'test Tennis', venueAbbreviation: 'Test' },
    returnDetails: true,
  });

  const dateAvailability = availableDates.map((date) => ({
    startTime: '08:00',
    endTime: '22:00',
    date,
  }));

  tournamentEngine.addCourts({
    dateAvailability: dateAvailability,
    courtNames: ['1'],
    courtsCount: 1,
    venueId,
  });

  const generatePersons = (length) => {
    return [...new Array(length)].map((_, index) => {
      return {
        personId: index,
        standardFamilyName: `test-${index}`,
        standardGivenName: `test`,
        nationalityCode: 'BRA',
        sex: MALE,
      };
    });
  };

  const persons = generatePersons(3);
  tournamentEngine.addPersons({ persons });

  const { participants } = tournamentEngine.getParticipants();
  const participantIds = participants.map(
    (participant) => participant.participantId
  );

  const event = {
    eventName: 'Test Event',
    eventType: SINGLES_EVENT,
    eventGender: MALE,
  };

  const {
    event: { eventId },
  } = tournamentEngine.addEvent({ event });

  tournamentEngine.setEventDates({
    startDate,
    endDate,
    eventId,
  });

  tournamentEngine.addEventEntries({
    participantIds,
    eventId,
  });

  tournamentEngine.generateDrawDefinition({
    addToEvent: true,
    eventId: eventId,
  });

  const { rounds } = tournamentEngine.getRounds();
  const schedulingProfile = [
    {
      scheduleDate: availableDates[0],
      venues: [{ venueId, rounds }],
    },
  ];

  let result = competitionEngine.setSchedulingProfile({ schedulingProfile });

  result = competitionEngine.scheduleProfileRounds({
    scheduleDates: availableDates,
    pro: true,
  });
  expect(result.success).toEqual(true);
  expect(result.noTimeMatchUpIds[availableDates[0]]).toEqual([]);

  let { matchUps } = competitionEngine.allCompetitionMatchUps();
  let roundSchedules = matchUps
    .filter(({ matchUpStatus }) => matchUpStatus === TO_BE_PLAYED)
    .map(({ schedule: { scheduledTime, courtName }, roundNumber }) => [
      scheduledTime,
      roundNumber,
      courtName,
    ]);

  expect(roundSchedules).toStrictEqual([
    ['2022-01-01T08:00', 1, '1'],
    ['2022-01-01T09:30', 2, '1'],
  ]);

  // add a DO_NOT_SCHEDULE for the first person
  const requests = [
    {
      date: availableDates[0],
      requestType: 'DO_NOT_SCHEDULE',
      startTime: '07:00',
      endTime: '12:00',
    },
  ];

  competitionEngine.addPersonRequests({
    personId: persons[0].personId,
    requests,
  });

  result = competitionEngine.scheduleProfileRounds({
    scheduleDates: availableDates,
    clearScheduleDates: true,
    pro: true,
  });
  matchUps = competitionEngine.allCompetitionMatchUps().matchUps;
  roundSchedules = matchUps
    .filter(({ matchUpStatus }) => matchUpStatus === TO_BE_PLAYED)
    .map(({ schedule: { courtName }, roundNumber }) => [
      roundNumber,
      courtName,
    ]);
  expect(roundSchedules).toEqual([
    [1, '1'],
    [2, '1'],
  ]);
});
