import tournamentEngine from '../../sync';
import { competitionEngine, mocksEngine } from '../../..';

import { TEAM_MATCHUP } from '../../../constants/matchUpTypes';
import { TEAM_EVENT } from '../../../constants/eventConstants';

test('it can allocate courts to a TEAM matchUp', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ eventType: TEAM_EVENT, drawSize: 8 }],
    venueProfiles: [{ courtsCount: 6 }],
  });

  tournamentEngine.setState(tournamentRecord);

  const teamMatchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM_MATCHUP] },
  }).matchUps;
  const teamMatchUp = teamMatchUps[0];
  const { matchUpId, drawId } = teamMatchUp;

  const { courts } = tournamentEngine.getVenuesAndCourts();
  const courtIds = courts.map(({ courtId }) => courtId);

  let result = tournamentEngine.allocateTeamMatchUpCourts({
    matchUpId,
    courtIds,
    drawId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.findMatchUp({ matchUpId });
  let { allocatedCourts } = result.matchUp.schedule;
  expect(allocatedCourts.map(({ courtId }) => courtId)).toEqual(courtIds);

  result = competitionEngine.allocateTeamMatchUpCourts({
    removePriorValues: true,
    matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.findMatchUp({ matchUpId });
  expect(result.matchUp.schedule.allocatedCourts).toEqual(undefined);
  expect(result.matchUp.timeItems).toEqual(undefined);

  const scheduledDate = '2023-03-17';
  result = tournamentEngine.setMatchUpStatus({
    schedule: { courtIds, scheduledDate },
    matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);
  result = tournamentEngine.findMatchUp({ matchUpId });
  expect(
    result.matchUp.schedule.allocatedCourts.map(({ courtId }) => courtId)
  ).toEqual(courtIds);

  const matchUpFilters = { scheduledDate };
  result = competitionEngine.competitionScheduleMatchUps({ matchUpFilters });
  expect(result.dateMatchUps.length).toEqual(1);
  expect(
    result.dateMatchUps[0].schedule.allocatedCourts.map(
      ({ courtId }) => courtId
    )
  ).toEqual(courtIds);
});
