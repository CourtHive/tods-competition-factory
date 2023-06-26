import competitionEngine from '../../../../../competitionEngine/sync';
import tournamentEngine from '../../../../../tournamentEngine/sync';
import { mocksEngine } from '../../../../../mocksEngine';
import { unique } from '../../../../../utilities';
import { it, expect } from 'vitest';

import { INVALID_VALUES } from '../../../../../constants/errorConditionConstants';
import { SCHEDULE_WARNING } from '../../../../../constants/scheduleConstants';
import {
  FOLLOWED_BY,
  NEXT_AVAILABLE,
} from '../../../../../constants/timeItemConstants';

const startDate = '2023-06-16';
const venueId = 'cc-venue-id';
const tournamentId = 'tid';
const idPrefix = 'cc-court';
const drawId = 'did';

it('will not scheduled earlier rounds after later rounds', () => {
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
        timeModifiers: undefined,
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

it('will not save overlapping timeModifiers', () => {
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

  let matchUps = competitionEngine.allCompetitionMatchUps({
    nextMatchUps: true,
    inContext: true,
  }).matchUps;

  const scheduleMatchUps = {
    params: { scheduledDate: startDate, matchUps },
    method: 'proAutoSchedule',
  };

  // First schedule all matchUps
  result = competitionEngine.executionQueue([scheduleMatchUps]);
  expect(result.success).toEqual(true);

  matchUps = competitionEngine.allCompetitionMatchUps({
    nextMatchUps: true,
    inContext: true,
  }).matchUps;

  let firstRowMatchUpIds = matchUps
    .filter(({ schedule }) => schedule?.courtOrder === 1)
    .map(({ matchUpId }) => matchUpId);

  let secondRowMatchUpIds = matchUps
    .filter(({ schedule }) => schedule?.courtOrder === 2)
    .map(({ matchUpId }) => matchUpId);

  let bulkScheduleFirst = {
    method: 'bulkScheduleMatchUps',
    params: {
      schedule: { scheduledTime: '08:00' },
      matchUpIds: firstRowMatchUpIds,
    },
  };

  result = tournamentEngine.executionQueue([bulkScheduleFirst]);
  expect(result.success).toEqual(true);

  let bulkScheduleSecond = {
    method: 'bulkScheduleMatchUps',
    params: {
      schedule: { timeModifiers: NEXT_AVAILABLE },
      matchUpIds: secondRowMatchUpIds,
    },
  };

  result = tournamentEngine.executionQueue([bulkScheduleSecond]);
  expect(result.error).toEqual(INVALID_VALUES);

  bulkScheduleSecond = {
    method: 'bulkScheduleMatchUps',
    params: {
      schedule: { timeModifiers: [NEXT_AVAILABLE] },
      matchUpIds: secondRowMatchUpIds,
    },
  };

  result = tournamentEngine.executionQueue([bulkScheduleSecond]);
  expect(result.success).toEqual(true);

  bulkScheduleSecond = {
    method: 'bulkScheduleMatchUps',
    params: {
      schedule: { timeModifiers: [FOLLOWED_BY] },
      matchUpIds: secondRowMatchUpIds,
    },
  };

  result = tournamentEngine.executionQueue([bulkScheduleSecond]);
  expect(result.success).toEqual(true);

  matchUps = competitionEngine.allCompetitionMatchUps({
    nextMatchUps: true,
    inContext: true,
  }).matchUps;

  let firstRowMatchUps = matchUps.filter(
    ({ schedule }) => schedule?.courtOrder === 1
  );

  let secondRowMatchUps = matchUps.filter(
    ({ schedule }) => schedule?.courtOrder === 2
  );

  expect(firstRowMatchUps.every(({ schedule }) => schedule.scheduledTime));
  expect(
    secondRowMatchUps.every(
      ({ schedule }) => schedule.timeModifiers === [FOLLOWED_BY]
    )
  );

  bulkScheduleFirst = {
    method: 'bulkScheduleMatchUps',
    params: {
      schedule: { timeModifiers: [FOLLOWED_BY] },
      matchUpIds: firstRowMatchUpIds,
    },
  };

  result = tournamentEngine.executionQueue([bulkScheduleFirst]);
  expect(result.success).toEqual(true);

  matchUps = competitionEngine.allCompetitionMatchUps({
    nextMatchUps: true,
    inContext: true,
  }).matchUps;

  firstRowMatchUps = matchUps.filter(
    ({ schedule }) => schedule?.courtOrder === 1
  );

  // confirm scheduledTime for first row matchUps removed when exlusive timeModifier added
  expect(
    firstRowMatchUps.every(({ schedule }) => !schedule.scheduledTime)
  ).toEqual(true);

  bulkScheduleFirst = {
    method: 'bulkScheduleMatchUps',
    params: {
      schedule: { scheduledTime: '08:00' },
      matchUpIds: firstRowMatchUpIds,
    },
  };

  result = tournamentEngine.executionQueue([bulkScheduleFirst]);
  expect(result.success).toEqual(true);

  matchUps = competitionEngine.allCompetitionMatchUps({
    nextMatchUps: true,
    inContext: true,
  }).matchUps;

  firstRowMatchUps = matchUps.filter(
    ({ schedule }) => schedule?.courtOrder === 1
  );

  // confirm timeModifiers for first row matchUps removed when scheduledTime added
  expect(
    firstRowMatchUps.every(
      ({ schedule }) =>
        schedule.scheduledTime && !schedule.timeModifiers?.length
    )
  ).toEqual(true);
});
