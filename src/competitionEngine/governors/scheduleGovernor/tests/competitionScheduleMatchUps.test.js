import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../../tournamentEngine/sync';
import competitionEngine from '../../../sync';

it('auto schedules venue if only one venue provided', () => {
  const drawProfiles = [{ drawSize: 16 }, { drawSize: 64 }];
  const venueProfiles = [{ courtsCount: 3 }];

  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    startDate: '2021-05-05',
    endDate: '2021-05-07',
    drawProfiles,
    venueProfiles,
  });

  const { tournamentInfo } = tournamentEngine.getTournamentInfo();
  const { upcomingMatchUps } = competitionEngine.competitionMatchUps();

  const { startDate } = tournamentInfo;
  const matchUpIds = upcomingMatchUps.map(({ matchUpId }) => matchUpId);

  let result = competitionEngine
    .setState([tournamentRecord])
    .scheduleMatchUps({ date: startDate, matchUpIds });
  expect(result.success).toEqual(true);
  expect(result.scheduledMatchUpIds.length).toEqual(23);

  const matchUpFilters = { scheduledDate: '2021-05-05' };
  result = competitionEngine.competitionScheduleMatchUps({
    matchUpFilters,
  });
  expect(result.dateMatchUps.length).toEqual(23);

  matchUpFilters.scheduledDate = '2021-05-06';
  result = competitionEngine.competitionScheduleMatchUps({
    matchUpFilters,
  });
  expect(result.dateMatchUps.length).toEqual(0);

  result = competitionEngine.scheduleMatchUps({ date: startDate, matchUpIds });
  console.log(result.scheduledMatchUpIds.length);
});
