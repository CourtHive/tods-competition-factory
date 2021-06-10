import POLICY_SCHEDULING_USTA from '../../../../fixtures/policies/POLICY_SCHEDULING_USTA';
import POLICY_SCORING_USTA from '../../../../fixtures/policies/POLICY_SCORING_USTA';
import mocksEngine from '../../../../mocksEngine';
import competitionEngine from '../../../sync';

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
    scoreString: '2-6 7-5 6-7(3)',
    winningSide: 2,
  });

  let result = competitionEngine.setMatchUpStatus({
    tournamentId,
    matchUpId,
    drawId,
    outcome,
    schedule: { scheduledDate: startDate },
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
      drawId,
      eventId,
      matchUpId,
      tournamentId,
      schedule: {
        scheduledDate: startDate,
      },
      winningSide: 1,
      score: outcome.score,
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
    tournamentRecord,
    venueIds: [venueId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    venueProfiles,
  });

  competitionEngine.setState(tournamentRecord);
  const { startDate } = competitionEngine.getCompetitionDateRange();

  let { upcomingMatchUps } = competitionEngine.competitionMatchUps();

  const matchUpContextIds = upcomingMatchUps.map(
    ({ tournamentId, drawId, matchUpId }) => ({
      tournamentId,
      matchUpId,
      drawId,
    })
  );

  const schedule = {
    scheduledTime: '08:00',
    scheduledDate: startDate,
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

  upcomingMatchUps.forEach(({ schedule }) => {
    expect(schedule.scheduledDate).toEqual(startDate);
  });
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

  competitionEngine.attachPolicy({
    policyDefinition: POLICY_SCHEDULING_USTA,
  });

  let result = competitionEngine.getEventMatchUpFormatTiming({
    eventId,
  });

  let { eventMatchUpFormatTiming, error } = result;
  expect(eventMatchUpFormatTiming).toBeUndefined();
  expect(error).not.toBeUndefined();

  result = competitionEngine.modifyEventMatchUpFormatTiming({
    eventId,
    matchUpFormat: 'SET3-S:6/TB7',
    averageMinutes: 127,
  });
  expect(result.success).toEqual(true);

  result = competitionEngine.modifyEventMatchUpFormatTiming({
    eventId,
    matchUpFormat: 'SET1-S:4/TB10',
    averageMinutes: 137,
  });
  expect(result.success).toEqual(true);

  // overwriting value of 137 with 117
  result = competitionEngine.modifyEventMatchUpFormatTiming({
    eventId,
    matchUpFormat: 'SET1-S:4/TB10',
    averageMinutes: 117,
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
      eventId,
      matchUpFormats: ['SET3-S:6/TB7', 'SET1-S:4/TB10', 'SET1-S:4/TB10'],
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
      eventId,
      matchUpFormats: ['SET3-S:6/TB7', 'SET1-S:4/TB10'],
    }
  ));
  expect(eventMatchUpFormatTiming.map((t) => t.averageMinutes)).toEqual([
    90, 90,
  ]);

  ({ eventMatchUpFormatTiming, error } =
    competitionEngine.getEventMatchUpFormatTiming({
      eventId,
    }));

  expect(eventMatchUpFormatTiming).toBeUndefined();
  expect(error).not.toBeUndefined();

  const policyDefinition = POLICY_SCORING_USTA;
  competitionEngine.attachPolicy({ policyDefinition, allowReplacement: true });

  ({ eventMatchUpFormatTiming } = competitionEngine.getEventMatchUpFormatTiming(
    {
      eventId,
    }
  ));
  expect(policyDefinition.scoring.matchUpFormats.length).toEqual(
    eventMatchUpFormatTiming.length
  );
});
