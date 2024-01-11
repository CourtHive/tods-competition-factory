import { getMatchUpIds } from '../../../global/functions/extractors';
import mocksEngine from '../../../assemblies/engines/mock';
import tournamentEngine from '../../engines/syncEngine';
import { expect, it } from 'vitest';

it('auto schedules venue if only one venue provided', () => {
  const drawProfiles = [{ drawSize: 16 }, { drawSize: 64 }];
  const venueProfiles = [{ courtsCount: 3 }];

  let startDate = '2020-01-01';
  const { tournamentRecord, venueIds } = mocksEngine.generateTournamentRecord({
    venueProfiles,
    drawProfiles,
    startDate,
  });

  tournamentEngine.setState(tournamentRecord);
  tournamentEngine.setState([tournamentRecord]);
  let { upcomingMatchUps } = tournamentEngine.getCompetitionMatchUps();

  const matchUpIds = getMatchUpIds(upcomingMatchUps);
  expect(matchUpIds.length).toBeGreaterThan(0);

  let result = tournamentEngine.scheduleMatchUps({
    scheduleDate: startDate,
    matchUpIds,
  });
  expect(result.success).toEqual(true);
  const scheduledMatchUpsCount = result.scheduledMatchUpIds.length;

  const matchUpFilters = { scheduledDate: startDate };
  result = tournamentEngine.competitionScheduleMatchUps({
    matchUpFilters,
  });
  expect(result.dateMatchUps.length).toEqual(scheduledMatchUpsCount);

  ({ upcomingMatchUps } = tournamentEngine.getCompetitionMatchUps());
  const { matchUpId } = upcomingMatchUps[0];

  expect(upcomingMatchUps[0].schedule.venueId).toEqual(venueIds[0]);
  expect(matchUpIds.includes(matchUpId)).toEqual(true);

  startDate = '2020-01-02';
  result = tournamentEngine.setTournamentStartDate({ startDate });
  expect(result.unscheduledMatchUpIds.length).toEqual(scheduledMatchUpsCount);

  result = tournamentEngine.competitionScheduleMatchUps({
    matchUpFilters,
  });
  expect(result.dateMatchUps.length).toEqual(0);
});
