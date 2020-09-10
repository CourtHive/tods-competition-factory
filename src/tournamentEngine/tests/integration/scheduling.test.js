import { tournamentEngine } from '../../../tournamentEngine';
import { competitionEngine } from '../../../competitionEngine';

import { matchUpTiming } from '../../../competitionEngine/governors/scheduleGovernor/garman/garman';
import { tournamentRecordWithParticipants } from '../primitives';

import { SINGLES } from '../../../constants/eventConstants';
import { SUCCESS } from '../../../constants/resultConstants';

let result;

it('can add events, venues, and schedule matchUps', () => {
  const startDate = '2020-01-01';
  const endDate = '2020-01-06';
  const participantsCount = 32;

  const {
    tournamentRecord: record,
    participants,
  } = tournamentRecordWithParticipants({
    startDate,
    endDate,
    participantsCount,
  });
  tournamentEngine.setState(record);

  const event = {
    eventName: 'Test Event',
    eventType: SINGLES,
  };

  result = tournamentEngine.addEvent({ event });
  const { Event, success } = result;
  const { eventId } = Event;
  expect(success).toEqual(true);

  const participantIds = participants.map(p => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result).toEqual(SUCCESS);

  const values = {
    automated: true,
    drawSize: 32,
    eventId,
    participants,
    event: Event,
  };
  const { drawDefinition } = tournamentEngine.generateDrawDefinition(values);
  const { drawId } = drawDefinition;

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result).toEqual(SUCCESS);

  const myCourts = { venueName: 'My Courts' };
  result = tournamentEngine.addVenue({ venue: myCourts });
  const {
    venue: { venueId },
  } = result;
  expect(result.success).toEqual(true);

  const date = '2020-01-01';
  const dateAvailability = [
    {
      date,
      startTime: '07:00',
      endTime: '19:00',
      bookings: [
        { startTime: '7:00', endTime: '8:30', bookingType: 'PRACTICE' },
        { startTime: '8:30', endTime: '9:00', bookingType: 'MAINTENANCE' },
        { startTime: '13:30', endTime: '14:00', bookingType: 'MAINTENANCE' },
      ],
    },
  ];
  let { courts } = tournamentEngine.addCourts({
    venueId,
    courtsCount: 3,
    dateAvailability,
  });
  expect(courts.length).toEqual(3);

  ({ courts } = tournamentEngine.getCourts());
  expect(courts.length).toEqual(3);

  const {
    upcomingMatchUps: upcoming,
    pendingMatchUps,
  } = tournamentEngine.tournamentMatchUps();
  expect(upcoming.length).toEqual(16);
  expect(pendingMatchUps.length).toEqual(15);

  const timingParameters = {
    date,
    courts,
    startTime: '8:00',
    endTime: ' 19:00',
    periodLength: 30,
    averageMatchTime: 90,
  };
  const { scheduleTimes } = matchUpTiming(timingParameters);
  expect(scheduleTimes.length).toEqual(19);

  let tournamentRecord = tournamentEngine.getState();
  const { tournamentId } = tournamentRecord;
  let tournamentRecords = { [tournamentId]: tournamentRecord };

  result = competitionEngine
    .setState(tournamentRecords)
    .scheduleMatchUps({ date, matchUps: upcoming });
  expect(result).toEqual(SUCCESS);

  tournamentRecords = competitionEngine.getState();
  tournamentRecord = tournamentRecords[tournamentId];
  tournamentEngine.setState(tournamentRecord);

  const scheduledDate = '2020-01-01';
  let contextFilters = {
    eventIds: [],
    drawIds: [drawId],
    structureIds: [],
    roundNumbers: [1],
  };

  let { upcomingMatchUps } = tournamentEngine.tournamentMatchUps({
    contextFilters,
  });
  expect(upcomingMatchUps.length).toEqual(16);

  contextFilters = { scheduledDate: '2020-01-02' };
  ({ upcomingMatchUps } = tournamentEngine.tournamentMatchUps({
    contextFilters,
  }));
  expect(upcomingMatchUps.length).toEqual(0);

  const courtIds = courts.map(court => court.courtId);
  const courtId = courtIds[0];

  let { matchUps } = tournamentEngine.allTournamentMatchUps();
  const [matchUp] = matchUps;
  const { matchUpId } = matchUp;

  result = tournamentEngine.assignMatchUpCourt({
    matchUpId,
    courtId,
    drawId,
    courtDayDate: scheduledDate,
  });
  expect(result).toEqual(SUCCESS);

  contextFilters = { courtIds };
  ({ matchUps } = tournamentEngine.allTournamentMatchUps({ contextFilters }));
  expect(matchUps.length).toEqual(1);

  let { venues } = tournamentEngine.getVenues();
  expect(venues.length).toEqual(1);

  result = tournamentEngine.deleteVenue({ venueId });
  expect(result).toEqual(SUCCESS);

  ({ venues } = tournamentEngine.getVenues());
  expect(venues.length).toEqual(0);
});
