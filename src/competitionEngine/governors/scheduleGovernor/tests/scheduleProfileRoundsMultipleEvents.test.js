import { visualizeScheduledMatchUps } from '../../../../global/testHarness/testUtilities/visualizeScheduledMatchUps';
import tournamentEngine from '../../../../tournamentEngine/sync';
import { hasSchedule } from '../scheduleMatchUps/hasSchedule';
import mocksEngine from '../../../../mocksEngine';
import competitionEngine from '../../../sync';

import POLICY_SCHEDULING_NO_DAILY_LIMITS from '../../../../fixtures/policies/POLICY_SCHEDULING_NO_DAILY_LIMITS';
import { MISSING_TOURNAMENT_ID } from '../../../../constants/errorConditionConstants';
import { DOUBLES, SINGLES } from '../../../../constants/eventConstants';
import { PAIR } from '../../../../constants/participantConstants';
import { INDIVIDUAL } from '../../../../constants/participantTypes';

it('auto schedules multiple events at multiple venues and tracks participants across venues', () => {
  const venueProfiles = [
    {
      venueName: 'venue 1',
      startTime: '08:00',
      endTime: '20:00',
      courtsCount: 4,
    },
    {
      venueName: 'venue 2',
      startTime: '08:00',
      endTime: '20:00',
      courtsCount: 2,
    },
  ];

  // the SAME participants will be in both SINGLES and DOUBLES
  const eventProfiles = [
    {
      eventName: 'Event One',
      eventType: SINGLES,
    },
    {
      eventName: 'Event Two',
      eventType: DOUBLES,
    },
  ];
  const startDate = '2022-01-01';
  const endDate = '2022-01-07';
  let result = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount: 100, participantType: PAIR },
    eventProfiles,
    venueProfiles,
    startDate,
    endDate,
  });
  const { eventIds, venueIds, tournamentRecord } = result;

  competitionEngine.setState(tournamentRecord);
  competitionEngine.attachPolicies({
    policyDefinitions: POLICY_SCHEDULING_NO_DAILY_LIMITS,
  });

  const { tournamentId } = tournamentRecord;

  let { competitionParticipants } =
    competitionEngine.getCompetitionParticipants({
      participantFilters: { participantTypes: [INDIVIDUAL] },
    });
  const firstEventParticipantIds = competitionParticipants
    .slice(0, 32)
    .map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({
    eventId: eventIds[0],
    participantIds: firstEventParticipantIds,
  });
  expect(result.success).toEqual(true);

  const drawIds = [];
  let { drawDefinition } = tournamentEngine.generateDrawDefinition({
    eventId: eventIds[0],
    drawSize: 32,
  });
  drawIds.push(drawDefinition.drawId);

  result = competitionEngine.addDrawDefinition({
    eventId: eventIds[0],
    drawDefinition,
  });
  expect(result.error).toEqual(MISSING_TOURNAMENT_ID);

  result = competitionEngine.addDrawDefinition({
    tournamentId,
    eventId: eventIds[0],
    drawDefinition,
  });
  expect(result.success).toEqual(true);

  // ----------------------------------------------
  // Add first two rounds of the first event's draw
  let {
    structures: [{ structureId }],
  } = drawDefinition;

  result = competitionEngine.addSchedulingProfileRound({
    scheduleDate: startDate,
    venueId: venueIds[0],
    round: {
      tournamentId,
      eventId: eventIds[0],
      drawId: drawIds[0],
      structureId,
      roundNumber: 1,
    },
  });
  expect(result.success).toEqual(true);

  result = competitionEngine.addSchedulingProfileRound({
    scheduleDate: startDate,
    venueId: venueIds[0],
    round: {
      tournamentId,
      eventId: eventIds[0],
      drawId: drawIds[0],
      structureId,
      roundNumber: 2,
    },
  });
  expect(result.success).toEqual(true);

  // --------------------------------------------------
  // generate draw for second event
  ({ competitionParticipants } = competitionEngine.getCompetitionParticipants({
    participantFilters: { participantTypes: [PAIR] },
  }));
  const secondEventParticipantIds = competitionParticipants
    .slice(0, 32)
    .map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({
    eventId: eventIds[1],
    participantIds: secondEventParticipantIds,
  });
  expect(result.success).toEqual(true);

  ({ drawDefinition } = tournamentEngine.generateDrawDefinition({
    eventId: eventIds[1],
    drawSize: 16,
  }));
  drawIds.push(drawDefinition.drawId);

  result = competitionEngine.addDrawDefinition({
    tournamentId,
    eventId: eventIds[1],
    drawDefinition,
  });
  expect(result.success).toEqual(true);

  // ----------------------------------------------
  // Add first two rounds of the second event's draw
  ({
    structures: [{ structureId }],
  } = drawDefinition);

  result = competitionEngine.addSchedulingProfileRound({
    scheduleDate: startDate,
    venueId: venueIds[1],
    round: {
      tournamentId,
      eventId: eventIds[1],
      drawId: drawIds[1],
      structureId,
      roundNumber: 1,
    },
  });
  expect(result.success).toEqual(true);

  result = competitionEngine.addSchedulingProfileRound({
    scheduleDate: startDate,
    venueId: venueIds[1],
    round: {
      tournamentId,
      eventId: eventIds[1],
      drawId: drawIds[1],
      structureId,
      roundNumber: 2,
    },
  });
  expect(result.success).toEqual(true);

  const { schedulingProfile } = competitionEngine.getSchedulingProfile();
  expect(schedulingProfile[0].venues[0].rounds.length).toEqual(2);
  expect(schedulingProfile[0].venues[0].rounds[0].eventId).toEqual(eventIds[0]);
  expect(schedulingProfile[0].venues[0].rounds[0].drawId).toEqual(drawIds[0]);
  expect(schedulingProfile[0].venues[1].rounds.length).toEqual(2);
  expect(schedulingProfile[0].venues[1].rounds[0].eventId).toEqual(eventIds[1]);
  expect(schedulingProfile[0].venues[1].rounds[0].drawId).toEqual(drawIds[1]);

  result = competitionEngine.getSchedulingProfileIssues();
  expect(
    Object.keys(result.profileIssues.matchUpIdShouldBeAfter).length
  ).toEqual(0);
  expect(result.success).toEqual(true);

  result = competitionEngine.scheduleProfileRounds({
    scheduleDates: [startDate],
  });
  expect(result.success).toEqual(true);
  expect(result.requestConflicts).toEqual([]);

  expect(result.noTimeMatchUpIds.length).toBeGreaterThan(0);

  const { matchUps: singlesMatchUps } =
    competitionEngine.allCompetitionMatchUps({
      matchUpFilters: { matchUpTypes: [SINGLES] },
    });
  expect(singlesMatchUps.length).toEqual(31);

  const { matchUps: doublesMatchUps } =
    competitionEngine.allCompetitionMatchUps({
      matchUpFilters: { matchUpTypes: [DOUBLES] },
    });
  expect(doublesMatchUps.length).toEqual(15);

  const singlesScheduled = singlesMatchUps.filter(hasSchedule);
  const doublesScheduled = doublesMatchUps.filter(hasSchedule);

  expect(singlesScheduled.length).toEqual(24);

  // because the same participants are in SINGLES and DOUBLES it is not possible to schedule
  // all of the doubles matchUps at the second venue, give the courts startTime/endTime
  expect(doublesScheduled.length).toBeGreaterThan(0);
  expect(doublesScheduled.length).toBeLessThan(8);

  const { matchUps } = competitionEngine.allCompetitionMatchUps();
  const scheduledMatchUps = matchUps.filter(hasSchedule);

  visualizeScheduledMatchUps({ scheduledMatchUps, showGlobalLog: true });
});
