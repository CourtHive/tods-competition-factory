import competitionEngine from '../../../../../competitionEngine/sync';
import tournamentEngine from '../../../../../tournamentEngine/sync';
import { mocksEngine } from '../../../../../mocksEngine';
import { unique } from '../../../../../utilities';
import { it, expect } from 'vitest';

import { SCHEDULE_WARNING } from '../../../../../constants/scheduleConstants';

it('will not scheduled earlier rounds after later rounds', () => {
  const startDate = '2023-06-16';
  const venueId = 'cc-venue-id';
  const tournamentId = 'tid';
  const idPrefix = 'cc-court';
  const drawId = 'did';

  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    venueProfiles: [
      {
        venueName: 'Club Courts',
        venueAbbreviation: 'CC',
        courtsCount: 6,
        idPrefix,
        venueId,
      },
    ],
    drawProfiles: [{ drawId, drawSize: 32, idPrefix: 'matchUp' }],
    tournamentId,
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  const matchUpId = 'matchUp-2-1';
  const scheduleOneSecondRoundMatchUp = {
    method: 'addMatchUpScheduleItems',
    params: {
      activeTournamentId: tournamentId,
      matchUpId,
      drawId,

      schedule: {
        courtId: `${idPrefix}-1`,
        scheduledDate: startDate,
        scheduledTime: '',
        timeModifiers: '',
        courtOrder: '1',
        venueId,
      },
    },
  };

  result = competitionEngine.executionQueue([scheduleOneSecondRoundMatchUp]);
  expect(result.success).toEqual(true);

  let matchUps = competitionEngine
    .allCompetitionMatchUps({ inContext: true, nextMatchUps: true })
    .matchUps.filter((m) => m.matchUpId !== matchUpId);

  const scheduleRemaining = {
    params: { scheduledDate: startDate, matchUps },
    method: 'proAutoSchedule',
  };

  result = competitionEngine.executionQueue([scheduleRemaining]);
  expect(result.success).toEqual(true);
  expect(result.results[0].scheduled.length).toEqual(25);
  expect(result.results[0].notScheduled.length).toEqual(5);

  const { dateMatchUps } = competitionEngine.competitionScheduleMatchUps({
    matchUpFilters: { scheduledDate: startDate },
  });
  expect(dateMatchUps.length).toEqual(26); // thus only 26 of 31 matchUps have been scheduled

  const { courtIssues } = competitionEngine.proConflicts({
    matchUps: dateMatchUps,
  });
  const issues = unique(
    Object.values(courtIssues)
      .flat()
      .map((c) => c.issue)
  );
  expect(issues).toEqual([SCHEDULE_WARNING]);
});
