import competitionEngine from '../../../competitionEngine/sync';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

it('auto schedules venue if only one venue provided', () => {
  const drawProfiles = [{ drawSize: 16 }, { drawSize: 64 }];
  const venueProfiles = [{ courtsCount: 3 }];

  const { tournamentRecord, venueIds } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    venueProfiles,
  });

  tournamentEngine.setState(tournamentRecord);
  const { tournamentInfo } = tournamentEngine.getTournamentInfo();
  competitionEngine.setState([tournamentRecord]);
  let { upcomingMatchUps } = competitionEngine.competitionMatchUps();

  const { startDate } = tournamentInfo;
  const matchUpIds = upcomingMatchUps.map(({ matchUpId }) => matchUpId);
  expect(matchUpIds.length).toBeGreaterThan(0);

  const result = competitionEngine.scheduleMatchUps({
    scheduleDate: startDate,
    matchUpIds,
  });
  expect(result.success).toEqual(true);

  ({ upcomingMatchUps } = competitionEngine.competitionMatchUps());
  const { matchUpId } = upcomingMatchUps[0];

  expect(upcomingMatchUps[0].schedule.venueId).toEqual(venueIds[0]);
  expect(matchUpIds.includes(matchUpId)).toEqual(true);
});
