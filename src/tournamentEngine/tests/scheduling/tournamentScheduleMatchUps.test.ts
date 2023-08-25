import { getMatchUpIds } from '../../../global/functions/extractors';
import competitionEngine from '../../../competitionEngine/sync';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
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
  competitionEngine.setState([tournamentRecord]);
  let { upcomingMatchUps } = competitionEngine.competitionMatchUps();

  const matchUpIds = getMatchUpIds(upcomingMatchUps);
  expect(matchUpIds.length).toBeGreaterThan(0);

  let result = competitionEngine.scheduleMatchUps({
    scheduleDate: startDate,
    matchUpIds,
  });
  expect(result.success).toEqual(true);
  const scheduledMatchUpsCount = result.scheduledMatchUpIds.length;

  const matchUpFilters = { scheduledDate: startDate };
  result = competitionEngine.competitionScheduleMatchUps({
    matchUpFilters,
  });
  expect(result.dateMatchUps.length).toEqual(scheduledMatchUpsCount);

  ({ upcomingMatchUps } = competitionEngine.competitionMatchUps());
  const { matchUpId } = upcomingMatchUps[0];

  expect(upcomingMatchUps[0].schedule.venueId).toEqual(venueIds[0]);
  expect(matchUpIds.includes(matchUpId)).toEqual(true);

  startDate = '2020-01-02';
  result = tournamentEngine.setTournamentStartDate({ startDate });
  expect(result.unscheduledMatchUpIds.length).toEqual(scheduledMatchUpsCount);

  result = competitionEngine.competitionScheduleMatchUps({
    matchUpFilters,
  });
  expect(result.dateMatchUps.length).toEqual(0);
});
