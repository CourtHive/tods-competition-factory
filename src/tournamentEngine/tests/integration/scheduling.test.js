import { tournamentEngine } from '../../../tournamentEngine';
import { competitionEngine } from '../../../competitionEngine';

import { matchUpTiming } from '../../../competitionEngine/governors/scheduleGovernor/garman/garman';
import { generateTournamentWithParticipants } from '../../../mocksEngine/generators/generateTournamentWithParticipants';

import { SINGLES } from '../../../constants/eventConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  ASSIGN_COURT,
  SCHEDULED_DATE,
  SCHEDULED_TIME,
  ASSIGN_VENUE,
} from '../../../constants/timeItemConstants';

it('can add events, venues, and schedule matchUps', () => {
  const startDate = '2020-01-01';
  const endDate = '2020-01-06';
  const participantsCount = 32;

  const {
    tournamentRecord: record,
    participants,
  } = generateTournamentWithParticipants({
    startDate,
    endDate,
    participantsCount,
  });
  tournamentEngine.setState(record);

  const event = {
    eventName: 'Test Event',
    eventType: SINGLES,
  };

  let result = tournamentEngine.addEvent({ event });
  const { event: eventResult, success } = result;
  const { eventId } = eventResult;
  expect(success).toEqual(true);

  const participantIds = participants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result).toEqual(SUCCESS);

  const values = {
    automated: true,
    drawSize: 32,
    eventId,
    participants,
    event: eventResult,
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
  let { courts } = tournamentEngine.addCourts({
    venueId,
    courtsCount: 3,
    dateAvailability,
  });
  expect(courts.length).toEqual(3);

  ({ courts } = tournamentEngine.getCourts());
  expect(courts.length).toEqual(3);

  let { tournamentRecord } = tournamentEngine.getState();
  expect(tournamentRecord.venues.length).toEqual(1);

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
    averageMatchUpTime: 90,
  };
  const { scheduleTimes } = matchUpTiming(timingParameters);
  expect(scheduleTimes.length).toEqual(19);

  ({ tournamentRecord } = tournamentEngine.getState());
  const tournamentId =
    tournamentRecord.unifiedTournamentId?.tournamentId ||
    tournamentRecord.tournamentId;
  let tournamentRecords = { [tournamentId]: tournamentRecord };

  result = competitionEngine
    .setState(tournamentRecords)
    .scheduleMatchUps({ date, matchUps: upcoming });
  expect(result).toEqual(SUCCESS);

  ({ tournamentRecords } = competitionEngine.getState());
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

  const courtIds = courts.map((court) => court.courtId);
  const courtId = courtIds[0];

  let { matchUps } = tournamentEngine.allTournamentMatchUps();
  let [matchUp] = matchUps;
  const { matchUpId } = matchUp;

  result = tournamentEngine.assignMatchUpVenue({
    matchUpId,
    venueId,
    drawId,
  });
  expect(result).toEqual(SUCCESS);

  result = tournamentEngine.assignMatchUpCourt({
    tournamentRecord,
    matchUpId,
    courtId,
    drawId,
    courtDayDate: scheduledDate,
  });
  expect(result).toEqual(SUCCESS);

  const scheduledDayDate = '2020-01-03';
  result = tournamentEngine.addMatchUpScheduledDayDate({
    drawId,
    matchUpId,
    scheduledDayDate,
  });
  expect(result).toEqual(SUCCESS);

  const scheduledTime = '2020-01-03T13:00';
  result = tournamentEngine.addMatchUpScheduledTime({
    drawId,
    matchUpId,
    scheduledTime,
  });
  expect(result).toEqual(SUCCESS);

  contextFilters = { courtIds };
  ({ matchUps } = tournamentEngine.allTournamentMatchUps({ contextFilters }));
  expect(matchUps.length).toEqual(1);

  // TODO: add startTime, stopTime, resumeTime, official

  matchUp = matchUps.find((matchUp) => matchUp.matchUpId === matchUpId);
  expect(matchUp.timeItems.length).toEqual(5);

  expect(matchUp.timeItems[0].itemType).toEqual(SCHEDULED_TIME);
  expect(matchUp.timeItems[1].itemType).toEqual(ASSIGN_VENUE);
  expect(matchUp.timeItems[2].itemType).toEqual(ASSIGN_COURT);
  expect(matchUp.timeItems[3].itemType).toEqual(SCHEDULED_DATE);
  expect(matchUp.timeItems[4].itemType).toEqual(SCHEDULED_TIME);

  const { schedule } = matchUp;
  expect(schedule.courtId).toEqual(courtId);
  expect(schedule.venueId).toEqual(venueId);
  expect(schedule.scheduledTime).toEqual(scheduledTime);

  let { venues } = tournamentEngine.getVenues();
  expect(venues.length).toEqual(1);

  result = tournamentEngine.deleteVenue({ venueId });
  expect(result.success).toBeUndefined();
  expect(result.message).not.toBeUndefined();

  result = tournamentEngine.deleteVenue({ venueId, force: true });
  expect(result).toEqual(SUCCESS);

  ({ venues } = tournamentEngine.getVenues());
  expect(venues.length).toEqual(0);
});
