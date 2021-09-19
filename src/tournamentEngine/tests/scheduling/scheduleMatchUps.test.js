import { getScheduleTimes } from '../../../competitionEngine/governors/scheduleGovernor/garman/getScheduleTimes';
import { removeCourtAssignment } from '../../governors/venueGovernor/removeCourtAssignment';
import { competitionEngine } from '../../../competitionEngine/sync';
import { setSubscriptions } from '../../../global/globalState';
import mocksEngine from '../../../mocksEngine';
import { tournamentEngine } from '../../sync';

import { DELETE_VENUE, MODIFY_VENUE } from '../../../constants/topicConstants';
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

let venueModificationsCounter = 0;
let venueDeletionsCounter = 0;
setSubscriptions({
  subscriptions: {
    [MODIFY_VENUE]: () => {
      venueModificationsCounter += 1;
    },
    [DELETE_VENUE]: () => {
      venueDeletionsCounter += 1;
    },
  },
});

// this is necessary to ensure that at least one millisecond has passed between modifications
async function forceDelay(delay = 10) {
  return new Promise((resolve) => setTimeout(() => resolve(), delay));
}

it('can add events, venues, and schedule matchUps and modify drawDefinition.updatedAt', async () => {
  const startDate = '2020-01-01';
  const endDate = '2020-01-06';
  const participantsCount = 32;

  const { tournamentRecord: record } = mocksEngine.generateTournamentRecord({
    startDate,
    endDate,
    participantsProfile: { participantsCount },
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
  expect(result.success).toEqual(true);

  const values = {
    automated: true,
    drawSize: 32,
    eventId,
    participants,
    event: eventResult,
  };
  let { drawDefinition } = tournamentEngine.generateDrawDefinition(values);
  const { drawId } = drawDefinition;
  let lastUpdatedAt = drawDefinition.updatedAt;

  await forceDelay();

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result.success).toEqual(true);

  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
  expect(lastUpdatedAt).toBeLessThan(drawDefinition.updatedAt);
  lastUpdatedAt = drawDefinition.updatedAt;

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
    startTime: '08:00',
    endTime: ' 19:00',
    periodLength: 30,
    averageMatchUpMinutes: 90,
  };
  const { scheduleTimes } = getScheduleTimes(timingParameters);
  expect(scheduleTimes.length).toEqual(18);

  ({ tournamentRecord } = tournamentEngine.getState());
  const tournamentId =
    tournamentRecord.unifiedTournamentId?.tournamentId ||
    tournamentRecord.tournamentId;
  let tournamentRecords = { [tournamentId]: tournamentRecord };

  await forceDelay();

  const matchUpIds = upcoming.map(({ matchUpId }) => matchUpId);
  result = competitionEngine
    .setState(tournamentRecords)
    .scheduleMatchUps({ scheduleDate: date, matchUpIds });
  expect(result.success).toEqual(true);

  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
  expect(lastUpdatedAt).toBeLessThan(drawDefinition.updatedAt);
  lastUpdatedAt = drawDefinition.updatedAt;

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

  await forceDelay();

  result = tournamentEngine.assignMatchUpVenue({
    venueId,
    drawId,
  });
  expect(result.error).toEqual(MISSING_MATCHUP_ID);

  result = tournamentEngine.assignMatchUpVenue({
    matchUpId,
    venueId,
    drawId,
  });
  expect(result.success).toEqual(true);

  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
  expect(lastUpdatedAt).toBeLessThan(drawDefinition.updatedAt);
  lastUpdatedAt = drawDefinition.updatedAt;

  result = tournamentEngine.assignMatchUpVenue({
    matchUpId,
    venueId: undefined,
    drawId,
  });
  expect(result.success).toEqual(true);

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
  expect(result.success).toEqual(true);

  await forceDelay();

  result = tournamentEngine.assignMatchUpCourt({
    tournamentRecord,
    courtId,
    drawId,
    courtDayDate: scheduledDate,
  });
  expect(result.error).toEqual(MISSING_MATCHUP_ID);

  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
  expect(lastUpdatedAt).toBeLessThan(drawDefinition.updatedAt);
  lastUpdatedAt = drawDefinition.updatedAt;

  result = tournamentEngine.assignMatchUpCourt({
    tournamentRecord,
    matchUpId,
    courtId,
    drawId,
    courtDayDate: scheduledDate,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.assignMatchUpCourt({
    tournamentRecord,
    matchUpId,
    courtId: undefined,
    drawId,
    courtDayDate: scheduledDate,
  });
  expect(result.success).toEqual(true);

  ({
    matchUp: { schedule },
  } = tournamentEngine.findMatchUp({
    drawId,
    matchUpId,
  }));
  expect(schedule.courtId).toBeUndefined();

  await forceDelay();

  result = tournamentEngine.assignMatchUpCourt({
    tournamentRecord,
    matchUpId,
    courtId,
    drawId,
    courtDayDate: scheduledDate,
  });
  expect(result.success).toEqual(true);

  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
  expect(lastUpdatedAt).toBeLessThan(drawDefinition.updatedAt);
  lastUpdatedAt = drawDefinition.updatedAt;

  await forceDelay();

  scheduledDate = '2020-01-03';
  result = tournamentEngine.addMatchUpScheduledDate({
    drawId,
    matchUpId,
    scheduledDate,
  });
  expect(result.success).toEqual(true);

  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
  expect(lastUpdatedAt).toBeLessThan(drawDefinition.updatedAt);
  lastUpdatedAt = drawDefinition.updatedAt;

  await forceDelay();

  const scheduledTime = '08:00';
  result = tournamentEngine.addMatchUpScheduledTime({
    drawId,
    matchUpId,
    scheduledTime,
  });
  expect(result.success).toEqual(true);

  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
  expect(lastUpdatedAt).toBeLessThan(drawDefinition.updatedAt);
  lastUpdatedAt = drawDefinition.updatedAt;

  await forceDelay();

  const startTime = '08:00';
  result = tournamentEngine.addMatchUpStartTime({
    drawId,
    matchUpId,
    startTime,
  });
  expect(result.success).toEqual(true);

  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
  expect(lastUpdatedAt).toBeLessThan(drawDefinition.updatedAt);
  lastUpdatedAt = drawDefinition.updatedAt;

  await forceDelay();

  const endTime = '14:30';
  result = tournamentEngine.addMatchUpEndTime({
    drawId,
    matchUpId,
    endTime,
  });
  expect(result.success).toEqual(true);

  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
  expect(lastUpdatedAt).toBeLessThan(drawDefinition.updatedAt);
  lastUpdatedAt = drawDefinition.updatedAt;

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
  result = tournamentEngine.getVenuesAndCourts();
  result = tournamentEngine.deleteCourt({ courtId });
  expect(result.error).not.toBeUndefined();
  expect(result.message).not.toBeUndefined();

  let { venues } = tournamentEngine.getVenuesAndCourts();
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

  await forceDelay();

  result = tournamentEngine.deleteCourt({ courtId, force: true });
  expect(result.success).toEqual(true);
  expect(venueModificationsCounter).toEqual(2);

  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
  expect(lastUpdatedAt).toBeLessThan(drawDefinition.updatedAt);
  lastUpdatedAt = drawDefinition.updatedAt;

  result = tournamentEngine.deleteVenue({ venueId, force: true });
  expect(result.success).toEqual(true);
  expect(venueDeletionsCounter).toEqual(1);

  // drawDefinition has not been modified because deleteCourt removed all scheduling information from matchUps
  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
  expect(lastUpdatedAt).toEqual(drawDefinition.updatedAt);
  lastUpdatedAt = drawDefinition.updatedAt;

  ({ venues } = tournamentEngine.getVenuesAndCourts());
  expect(venues.length).toEqual(0);

  await forceDelay();

  result = tournamentEngine.addMatchUpScheduledTime({
    drawId,
    matchUpId,
    scheduledTime: undefined,
  });
  expect(result.success).toEqual(true);

  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
  expect(lastUpdatedAt).toBeLessThan(drawDefinition.updatedAt);
  lastUpdatedAt = drawDefinition.updatedAt;

  ({
    matchUp: { schedule },
  } = tournamentEngine.findMatchUp({
    drawId,
    matchUpId,
  }));
  expect(schedule.scheduledTime).toBeUndefined();

  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));

  // these are unit tests and therefore do not modify { updatedAt }
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

  const { tournamentRecord: record } = mocksEngine.generateTournamentRecord({
    startDate,
    endDate,
    participantsProfile: { participantsCount },
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
  expect(result.success).toEqual(true);

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
  expect(result.success).toEqual(true);

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
    startTime: '08:00',
    endTime: ' 19:00',
    periodLength: 30,
    averageMatchUpMinutes: 90,
  };
  const { scheduleTimes } = getScheduleTimes(timingParameters);
  expect(scheduleTimes.length).toEqual(18);

  ({ tournamentRecord } = tournamentEngine.getState());
  const tournamentId =
    tournamentRecord.unifiedTournamentId?.tournamentId ||
    tournamentRecord.tournamentId;
  let tournamentRecords = { [tournamentId]: tournamentRecord };

  const matchUpIds = upcoming.map(({ matchUpId }) => matchUpId);
  result = competitionEngine
    .setState(tournamentRecords)
    .scheduleMatchUps({ scheduleDate: date, matchUpIds });
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
  expect(result.success).toEqual(true);

  let {
    matchUp: { schedule },
  } = tournamentEngine.findMatchUp({
    drawId,
    matchUpId,
  });
  expect(schedule.venueId).toEqual(venueId);
});
