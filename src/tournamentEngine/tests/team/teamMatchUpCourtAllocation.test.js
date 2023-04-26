import { competitionEngine, mocksEngine } from '../../..';
import { unique } from '../../../utilities';
import tournamentEngine from '../../sync';
import { expect, test } from 'vitest';

import { FACTORY } from '../../../constants/extensionConstants';
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
  const { matchUpId, tournamentId, drawId } = teamMatchUp;

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

  result.courtsData.forEach((court) =>
    expect(
      court.matchUps.map(({ matchUpId }) => matchUpId).includes(matchUpId)
    ).toEqual(true)
  );

  result = competitionEngine.removeMatchUpCourtAssignment({
    courtId: courtIds[0],
    tournamentId,
    matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  result = competitionEngine.competitionScheduleMatchUps({ matchUpFilters });
  expect(result.dateMatchUps.length).toEqual(1);
  let updatedCourtIds = result.dateMatchUps[0].schedule.allocatedCourts.map(
    ({ courtId }) => courtId
  );
  expect(updatedCourtIds.includes(courtIds[0])).toEqual(false);

  result.dateMatchUps[0].schedule.allocatedCourts.forEach((court) => {
    const attrs = Object.keys(court);
    expect(attrs).toEqual(['venueId', 'courtId', 'venueName', 'courtName']);
  });

  expect(
    unique(
      result.dateMatchUps[0].schedule.allocatedCourts.map(
        ({ venueId }) => venueId
      )
    ).length
  ).toEqual(1);

  result = competitionEngine.removeMatchUpCourtAssignment({
    // not passing courtId will remove all allocatedCourts
    tournamentId,
    matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  result = competitionEngine.competitionScheduleMatchUps({ matchUpFilters });
  expect(result.dateMatchUps[0].schedule.allocatedCourts).toBeUndefined();

  result = tournamentEngine.getState();
  expect(
    result.tournamentRecord.extensions.filter(({ name }) => name === FACTORY)
      .length
  ).toEqual(1);
});
