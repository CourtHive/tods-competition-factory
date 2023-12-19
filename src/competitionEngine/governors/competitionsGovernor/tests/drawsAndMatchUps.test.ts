import { setSubscriptions } from '../../../../global/state/globalState';
import tournamentEngine from '../../../../examples/syncEngine';
import mocksEngine from '../../../../mocksEngine';
import competitionEngine from '../../../sync';
import { expect, test } from 'vitest';

import POLICY_SCHEDULING_DEFAULT from '../../../../fixtures/policies/POLICY_SCHEDULING_DEFAULT';
import POLICY_SCORING_USTA from '../../../../fixtures/policies/POLICY_SCORING_USTA';
import { FORMAT_STANDARD } from '../../../../fixtures/scoring/matchUpFormats';
import { ADD_MATCHUPS } from '../../../../constants/topicConstants';
import {
  ANACHRONISM,
  EVENT_NOT_FOUND,
  INVALID_VALUES,
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';

const SHORT4TB10 = 'SET1-S:4/TB10';
const matchUpAddNotices: number[] = [];

const subscriptions = {
  [ADD_MATCHUPS]: (payload) => {
    if (Array.isArray(payload)) {
      payload.forEach(({ matchUps }) => {
        matchUpAddNotices.push(matchUps.length);
      });
    }
  },
};

setSubscriptions({ subscriptions });

test('competitionEngine can addDrawDefinitions', () => {
  const drawSize = 32;
  const secondDrawSize = 16;
  const totalExpectedMatchUps = drawSize - 1 + secondDrawSize - 1;

  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize }],
  });
  const { tournamentId } = tournamentRecord;
  competitionEngine.setState(tournamentRecord);

  let { matchUps } = competitionEngine.allCompetitionMatchUps();
  expect(matchUps.length).toEqual(31);

  let result = tournamentEngine.generateDrawDefinition({
    drawSize: secondDrawSize,
    eventId,
  });

  const { drawDefinition } = result;

  result = competitionEngine.addDrawDefinition({
    drawDefinition,
    tournamentId,
  });
  expect(result.error).toEqual(MISSING_EVENT);
  result = competitionEngine.addDrawDefinition({
    tournamentId: 'bogusId',
    drawDefinition,
    eventId,
  });
  expect(result.error).toEqual(MISSING_TOURNAMENT_RECORD);
  result = competitionEngine.addDrawDefinition({
    eventId: 'bogusId',
    drawDefinition,
    tournamentId,
  });
  expect(result.error).toEqual(EVENT_NOT_FOUND);
  result = competitionEngine.addDrawDefinition({
    drawDefinition,
    tournamentId,
    eventId,
  });
  expect(result.success).toEqual(true);
  ({ matchUps } = competitionEngine.allCompetitionMatchUps());
  expect(matchUps.length).toEqual(totalExpectedMatchUps);
  expect(matchUpAddNotices).toEqual([31, 15]);
});

test('competitionEngine can setMatchUpStatus', () => {
  const drawProfiles = [{ drawSize: 32 }];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });

  competitionEngine.setState(tournamentRecord);
  const { startDate } = competitionEngine.getCompetitionDateRange();

  let { upcomingMatchUps } = competitionEngine.competitionMatchUps();

  const { matchUpId, drawId, tournamentId } = upcomingMatchUps[0];
  const { outcome } = mocksEngine.generateOutcomeFromScoreString({
    scoreString: '6-2 5-7 7-6(3)',
    winningSide: 2,
  });

  let result = competitionEngine.setMatchUpStatus({
    schedule: { scheduledDate: startDate },
    tournamentId,
    matchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  let { completedMatchUps } = competitionEngine.competitionMatchUps();
  expect(completedMatchUps.length).toEqual(1);

  expect(completedMatchUps[0].score.scoreStringSide1).toEqual(
    outcome.score.scoreStringSide1
  );

  ({ upcomingMatchUps } = competitionEngine.competitionMatchUps());

  const outcomes = upcomingMatchUps.map((matchUp) => {
    const { matchUpId, drawId, eventId, tournamentId } = matchUp;
    return {
      schedule: {
        scheduledDate: startDate,
      },
      score: outcome.score,
      winningSide: 2,
      tournamentId,
      matchUpId,
      eventId,
      drawId,
    };
  });

  result = competitionEngine.bulkMatchUpStatusUpdate({ outcomes });
  expect(result.success).toEqual(true);

  ({ completedMatchUps } = competitionEngine.competitionMatchUps());
  expect(completedMatchUps.length).toEqual(16);
  completedMatchUps.forEach(({ score, schedule }) => {
    expect(score.scoreStringSide1).toEqual(outcome.score.scoreStringSide1);
    expect(schedule.scheduledDate).toEqual(startDate);
  });
});

test('competitionEngine can bulkScheduleMatchUps', () => {
  const drawProfiles = [{ drawSize: 32 }];
  const venueProfiles = [{ courtsCount: 3 }];
  const {
    venueIds: [venueId],
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    venueProfiles,
    drawProfiles,
  });

  competitionEngine.setState(tournamentRecord);
  const { startDate } = competitionEngine.getCompetitionDateRange();

  let { upcomingMatchUps } = competitionEngine.competitionMatchUps();

  let matchUpContextIds = upcomingMatchUps.map(
    ({ tournamentId, drawId, matchUpId }) => ({
      tournamentId,
      matchUpId,
      drawId,
    })
  );

  let schedule = {
    scheduledDate: startDate,
    scheduledTime: '08:00',
    venueId,
  };
  let result = competitionEngine.bulkScheduleMatchUps({
    matchUpContextIds,
    schedule,
  });
  expect(result.success).toEqual(true);

  matchUpContextIds.forEach((contextIds) => {
    const { validActions } = competitionEngine.matchUpActions(contextIds);
    expect(validActions.length).toBeGreaterThan(0);
  });

  ({ upcomingMatchUps } = competitionEngine.competitionMatchUps());

  upcomingMatchUps.forEach(({ schedule, roundNumber }) => {
    expect(schedule.scheduledDate).toEqual(startDate);
    expect(roundNumber).toEqual(1);
  });

  const matchUps = competitionEngine.allCompetitionMatchUps({
    matchUpFilters: { drawIds: [drawId], roundNumbers: [2] },
  }).matchUps;

  matchUpContextIds = matchUps.map(({ tournamentId, drawId, matchUpId }) => ({
    tournamentId,
    matchUpId,
    drawId,
  }));

  schedule = {
    scheduledDate: startDate,
    scheduledTime: '08:00',
    venueId,
  };
  result = competitionEngine.bulkScheduleMatchUps({
    errorOnAnachronism: true,
    matchUpContextIds,
    schedule,
  });
  expect(result.error).toEqual(ANACHRONISM);

  schedule = {
    scheduledDate: startDate,
    scheduledTime: '08:00',
    venueId,
  };
  result = competitionEngine.bulkScheduleMatchUps({
    errorOnAnachronism: false,
    matchUpContextIds,
    schedule,
  });
  expect(result.warnings.length).toEqual(8);
  expect(result.warnings[0]).toEqual(ANACHRONISM);
  expect(result.success).toEqual(true);

  schedule = {
    scheduledDate: startDate,
    scheduledTime: '09:00',
    venueId,
  };
  result = competitionEngine.bulkScheduleMatchUps({
    errorOnAnachronism: true,
    matchUpContextIds,
    schedule,
  });
  expect(result.success).toEqual(true);
});

test('can modify event timing for matchUpFormat codes', () => {
  const {
    tournamentRecord: firstTournament,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32 }],
  });
  const { tournamentRecord: secondTournament } =
    mocksEngine.generateTournamentRecord({
      drawProfiles: [{ drawSize: 32 }],
    });

  competitionEngine.setState([firstTournament, secondTournament]);

  competitionEngine.attachPolicies({
    policyDefinitions: POLICY_SCHEDULING_DEFAULT,
  });

  let result = competitionEngine.getEventMatchUpFormatTiming({
    eventId,
  });
  // even with no policy, timing is defined / falls back to defaults
  expect(result.eventMatchUpFormatTiming).toBeDefined();

  let { eventMatchUpFormatTiming } = result;
  expect(eventMatchUpFormatTiming).toBeDefined();

  result = competitionEngine.modifyEventMatchUpFormatTiming({
    matchUpFormat: FORMAT_STANDARD,
    averageMinutes: 127,
  });
  expect(result.error).toEqual(MISSING_EVENT);

  result = competitionEngine.modifyEventMatchUpFormatTiming({
    matchUpFormat: FORMAT_STANDARD,
    tournamentId: 'bogusId',
    averageMinutes: 127,
    eventId,
  });
  expect(result.error).toEqual(INVALID_VALUES);

  result = competitionEngine.modifyEventMatchUpFormatTiming({
    matchUpFormat: FORMAT_STANDARD,
    averageMinutes: 127,
    eventId: 'bogusId',
  });
  expect(result.error).toEqual(EVENT_NOT_FOUND);

  result = competitionEngine.modifyEventMatchUpFormatTiming({
    matchUpFormat: FORMAT_STANDARD,
    averageMinutes: 127,
    eventId,
  });
  expect(result.success).toEqual(true);

  result = competitionEngine.modifyEventMatchUpFormatTiming({
    matchUpFormat: SHORT4TB10,
    averageMinutes: 137,
    eventId,
  });
  expect(result.success).toEqual(true);

  // overwriting value of 137 with 117
  result = competitionEngine.modifyEventMatchUpFormatTiming({
    matchUpFormat: SHORT4TB10,
    averageMinutes: 117,
    eventId,
  });
  expect(result.success).toEqual(true);

  ({ eventMatchUpFormatTiming } = competitionEngine.getEventMatchUpFormatTiming(
    {
      eventId,
    }
  ));

  expect(eventMatchUpFormatTiming.map((t) => t.averageMinutes)).toEqual([
    127, 117,
  ]);
  expect(eventMatchUpFormatTiming.map((t) => t.recoveryMinutes)).toEqual([
    60, 60,
  ]);

  ({ eventMatchUpFormatTiming } = competitionEngine.getEventMatchUpFormatTiming(
    {
      matchUpFormats: [FORMAT_STANDARD, SHORT4TB10, SHORT4TB10],
      eventId,
    }
  ));
  // expect duplicated matchUpFormat to be filtered out
  expect(eventMatchUpFormatTiming.map((t) => t.averageMinutes)).toEqual([
    127, 117,
  ]);

  result = competitionEngine.removeEventMatchUpFormatTiming({ eventId });
  expect(result.success).toEqual(true);

  ({ eventMatchUpFormatTiming } = competitionEngine.getEventMatchUpFormatTiming(
    {
      matchUpFormats: [FORMAT_STANDARD, SHORT4TB10],
      eventId,
    }
  ));
  expect(eventMatchUpFormatTiming.map((t) => t.averageMinutes)).toEqual([
    90, 90,
  ]);

  ({ eventMatchUpFormatTiming } = competitionEngine.getEventMatchUpFormatTiming(
    {
      eventId,
    }
  ));

  expect(eventMatchUpFormatTiming).toBeDefined();

  const policyDefinitions = POLICY_SCORING_USTA;
  competitionEngine.attachPolicies({
    allowReplacement: true,
    policyDefinitions,
  });

  ({ eventMatchUpFormatTiming } = competitionEngine.getEventMatchUpFormatTiming(
    {
      eventId,
    }
  ));
  expect(policyDefinitions.scoring.matchUpFormats.length).toEqual(
    eventMatchUpFormatTiming.length
  );

  result = competitionEngine.getEventMatchUpFormatTiming({
    eventId: 'bogusId',
  });
  expect(result.error).toEqual(EVENT_NOT_FOUND);

  result = competitionEngine.getEventMatchUpFormatTiming({
    tournamentId: 'bogusId',
    eventId,
  });
  expect(result.error).toEqual(INVALID_VALUES);
});
