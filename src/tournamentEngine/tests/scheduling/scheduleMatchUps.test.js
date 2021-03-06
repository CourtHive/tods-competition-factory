import { generateTournamentWithParticipants } from '../../../mocksEngine/generators/generateTournamentWithParticipants';
import { getScheduleTimes } from '../../../competitionEngine/governors/scheduleGovernor/garman/getScheduleTimes';
import { removeCourtAssignment } from '../../governors/venueGovernor/removeCourtAssignment';
import { competitionEngine } from '../../../competitionEngine/sync';
import { tournamentEngine } from '../../sync';

import { SUCCESS } from '../../../constants/resultConstants';
import { SINGLES } from '../../../constants/eventConstants';
import {
  MATCHUP_NOT_FOUND,
  MISSING_COURT_ID,
  MISSING_DRAW_ID,
  MISSING_MATCHUP_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VENUE_ID,
} from '../../../constants/errorConditionConstants';
import {
  ASSIGN_COURT,
  SCHEDULED_DATE,
  SCHEDULED_TIME,
  ASSIGN_VENUE,
  START_TIME,
} from '../../../constants/timeItemConstants';

tournamentEngine.devContext({ addVenue: true });

it('can add events, venues, and schedule matchUps', () => {
  const startDate = '2020-01-01';
  const endDate = '2020-01-06';
  const participantsCount = 32;

  const { tournamentRecord: record } = generateTournamentWithParticipants({
    startDate,
    endDate,
    participantsCount,
  });
  const { participants } = record;
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
  let { drawDefinition } = tournamentEngine.generateDrawDefinition(values);
  const { drawId } = drawDefinition;

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result).toEqual(SUCCESS);

  const myCourts = { venueName: 'My Courts' };
  result = tournamentEngine.addVenue({ venue: myCourts });
  const {
    venue: { venueId },
  } = result;
  expect(result.success).toEqual(true);

  // '2020-01-01' and '2020-01-01T00:00Z' work but '2020-01-01T00:00' does not work
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

  const { upcomingMatchUps: upcoming, pendingMatchUps } =
    tournamentEngine.tournamentMatchUps();
  expect(upcoming.length).toEqual(16);
  expect(pendingMatchUps.length).toEqual(15);

  const timingParameters = {
    date,
    courts,
    startTime: '8:00',
    endTime: ' 19:00',
    periodLength: 30,
    averageMatchUpMinutes: 90,
  };
  const { scheduleTimes } = getScheduleTimes(timingParameters);
  expect(scheduleTimes.length).toEqual(19);

  ({ tournamentRecord } = tournamentEngine.getState());
  const tournamentId =
    tournamentRecord.unifiedTournamentId?.tournamentId ||
    tournamentRecord.tournamentId;
  let tournamentRecords = { [tournamentId]: tournamentRecord };

  const matchUpIds = upcoming.map(({ matchUpId }) => matchUpId);
  result = competitionEngine
    .setState(tournamentRecords)
    .scheduleMatchUps({ date, matchUpIds });
  expect(result.success).toEqual(true);

  ({ tournamentRecords } = competitionEngine.getState());
  tournamentRecord = tournamentRecords[tournamentId];
  tournamentEngine.setState(tournamentRecord);

  let scheduledDate = '2020-01-01T00:00';
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

  contextFilters = { scheduledDate: '2020-01-02T00:00' };
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

  result = tournamentEngine.assignMatchUpVenue({
    matchUpId,
    venueId: undefined,
    drawId,
  });
  expect(result).toEqual(SUCCESS);
  let {
    matchUp: { schedule },
  } = tournamentEngine.findMatchUp({
    drawId,
    matchUpId,
  });
  expect(schedule.venueId).toBeUndefined();

  result = tournamentEngine.assignMatchUpVenue({
    matchUpId,
    venueId,
    drawId,
  });
  expect(result).toEqual(SUCCESS);

  result = tournamentEngine.assignMatchUpCourt({
    tournamentRecord,
    courtId,
    drawId,
    courtDayDate: scheduledDate,
  });
  expect(result.error).toEqual(MISSING_MATCHUP_ID);

  result = tournamentEngine.assignMatchUpCourt({
    tournamentRecord,
    matchUpId,
    courtId,
    drawId,
    courtDayDate: scheduledDate,
  });
  expect(result).toEqual(SUCCESS);

  result = tournamentEngine.assignMatchUpCourt({
    tournamentRecord,
    matchUpId,
    courtId: undefined,
    drawId,
    courtDayDate: scheduledDate,
  });
  expect(result).toEqual(SUCCESS);
  ({
    matchUp: { schedule },
  } = tournamentEngine.findMatchUp({
    drawId,
    matchUpId,
  }));
  expect(schedule.courtId).toBeUndefined();

  result = tournamentEngine.assignMatchUpCourt({
    tournamentRecord,
    matchUpId,
    courtId,
    drawId,
    courtDayDate: scheduledDate,
  });
  expect(result).toEqual(SUCCESS);

  scheduledDate = '2020-01-03';
  result = tournamentEngine.addMatchUpScheduledDate({
    drawId,
    matchUpId,
    scheduledDate,
  });
  expect(result).toEqual(SUCCESS);

  const scheduledTime = '08:00';
  result = tournamentEngine.addMatchUpScheduledTime({
    drawId,
    matchUpId,
    scheduledTime,
  });
  expect(result).toEqual(SUCCESS);

  const startTime = '08:00';
  result = tournamentEngine.addMatchUpStartTime({
    drawId,
    matchUpId,
    startTime,
  });
  expect(result).toEqual(SUCCESS);

  const endTime = '14:30';
  result = tournamentEngine.addMatchUpEndTime({
    drawId,
    matchUpId,
    endTime,
  });
  expect(result).toEqual(SUCCESS);

  contextFilters = { courtIds };
  ({ matchUps } = tournamentEngine.allTournamentMatchUps({ contextFilters }));
  expect(matchUps.length).toEqual(1);

  matchUp = matchUps.find((matchUp) => matchUp.matchUpId === matchUpId);

  expect(matchUp.timeItems[0].itemType).toEqual(SCHEDULED_TIME);
  expect(matchUp.timeItems[1].itemType).toEqual(ASSIGN_VENUE);
  expect(matchUp.timeItems[2].itemType).toEqual(ASSIGN_VENUE);
  expect(matchUp.timeItems[3].itemType).toEqual(ASSIGN_VENUE);
  expect(matchUp.timeItems[4].itemType).toEqual(ASSIGN_COURT);
  expect(matchUp.timeItems[5].itemType).toEqual(ASSIGN_COURT);
  expect(matchUp.timeItems[6].itemType).toEqual(ASSIGN_COURT);
  expect(matchUp.timeItems[7].itemType).toEqual(SCHEDULED_DATE);
  expect(matchUp.timeItems[8].itemType).toEqual(SCHEDULED_TIME);
  expect(matchUp.timeItems[9].itemType).toEqual(START_TIME);

  ({ schedule } = matchUp);
  expect(schedule.courtId).toEqual(courtId);
  expect(schedule.venueId).toEqual(venueId);
  expect(schedule.scheduledTime).toEqual(scheduledTime);

  result = tournamentEngine.deleteCourt();
  expect(result.error).toEqual(MISSING_COURT_ID);
  result = tournamentEngine.getVenues();
  result = tournamentEngine.deleteCourt({ courtId });
  expect(result.error).not.toBeUndefined();
  expect(result.message).not.toBeUndefined();

  let { venues } = tournamentEngine.getVenues();
  expect(venues.length).toEqual(1);

  result = tournamentEngine.deleteVenue();
  expect(result.error).toEqual(MISSING_VENUE_ID);
  result = competitionEngine.deleteVenue();
  expect(result.error).toEqual(MISSING_VENUE_ID);
  result = tournamentEngine.deleteVenue({ venueId: '12345' });
  expect(result.error).not.toBeUndefined();
  result = competitionEngine.deleteVenue({ venueId: '12345' });
  expect(result.error).not.toBeUndefined();

  result = tournamentEngine.deleteVenue({ venueId });
  expect(result.success).toBeUndefined();
  expect(result.message).not.toBeUndefined();

  result = tournamentEngine.deleteVenue({ venueId, force: true });
  expect(result).toEqual(SUCCESS);

  ({ venues } = tournamentEngine.getVenues());
  expect(venues.length).toEqual(0);

  result = tournamentEngine.addMatchUpScheduledTime({
    drawId,
    matchUpId,
    scheduledTime: undefined,
  });
  expect(result).toEqual(SUCCESS);

  ({
    matchUp: { schedule },
  } = tournamentEngine.findMatchUp({
    drawId,
    matchUpId,
  }));
  expect(schedule.scheduledTime).toBeUndefined();

  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
  result = removeCourtAssignment({ drawDefinition });
  expect(result.error).toEqual(MISSING_MATCHUP_ID);
  result = removeCourtAssignment({ matchUpId });
  expect(result.error).toEqual(MISSING_DRAW_ID);
  result = removeCourtAssignment({ matchUpId, drawId });
  expect(result.error).toEqual(MISSING_TOURNAMENT_RECORD);
  result = removeCourtAssignment({ drawDefinition, matchUpId: 'foo' });
  expect(result.error).toEqual(MATCHUP_NOT_FOUND);
  result = removeCourtAssignment({ drawDefinition, matchUpId });
  expect(result.success).toEqual(true);
});

it('adds venueId to matchUp.schedule when court is assigned', () => {
  const startDate = '2020-01-01';
  const endDate = '2020-01-06';
  const participantsCount = 32;

  const { tournamentRecord: record } = generateTournamentWithParticipants({
    startDate,
    endDate,
    participantsCount,
  });
  const { participants } = record;
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

  const date = '2020-01-01T00:00Z';
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

  const { upcomingMatchUps: upcoming, pendingMatchUps } =
    tournamentEngine.tournamentMatchUps();
  expect(upcoming.length).toEqual(16);
  expect(pendingMatchUps.length).toEqual(15);

  const timingParameters = {
    date,
    courts,
    startTime: '8:00',
    endTime: ' 19:00',
    periodLength: 30,
    averageMatchUpMinutes: 90,
  };
  const { scheduleTimes } = getScheduleTimes(timingParameters);
  expect(scheduleTimes.length).toEqual(19);

  ({ tournamentRecord } = tournamentEngine.getState());
  const tournamentId =
    tournamentRecord.unifiedTournamentId?.tournamentId ||
    tournamentRecord.tournamentId;
  let tournamentRecords = { [tournamentId]: tournamentRecord };

  const matchUpIds = upcoming.map(({ matchUpId }) => matchUpId);
  result = competitionEngine
    .setState(tournamentRecords)
    .scheduleMatchUps({ date, matchUpIds });
  expect(result.success).toEqual(true);

  ({ tournamentRecords } = competitionEngine.getState());
  tournamentRecord = tournamentRecords[tournamentId];
  tournamentEngine.setState(tournamentRecord);

  let scheduledDate = '2020-01-01T00:00';
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

  contextFilters = { scheduledDate: '2020-01-02T00:00' };
  ({ upcomingMatchUps } = tournamentEngine.tournamentMatchUps({
    contextFilters,
  }));
  expect(upcomingMatchUps.length).toEqual(0);

  const courtIds = courts.map((court) => court.courtId);
  const courtId = courtIds[0];

  let { matchUps } = tournamentEngine.allTournamentMatchUps();
  let [matchUp] = matchUps;
  const { matchUpId } = matchUp;

  result = tournamentEngine.assignMatchUpCourt({
    tournamentRecord,
    matchUpId,
    courtId,
    drawId,
    courtDayDate: scheduledDate,
  });
  expect(result).toEqual(SUCCESS);

  let {
    matchUp: { schedule },
  } = tournamentEngine.findMatchUp({
    drawId,
    matchUpId,
  });
  expect(schedule.venueId).toEqual(venueId);
});
