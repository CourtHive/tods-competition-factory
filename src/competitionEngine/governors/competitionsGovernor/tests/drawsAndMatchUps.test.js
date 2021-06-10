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

test.only('competitionEngine can bulkScheduleMatchUps', () => {
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
    ({ tournamentId, matchUpId }) => ({
      tournamentId,
      matchUpId,
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

  ({ upcomingMatchUps } = competitionEngine.competitionMatchUps());

  upcomingMatchUps.forEach(({ schedule }) => {
    expect(schedule.scheduledDate).toEqual(startDate);
  });
});
