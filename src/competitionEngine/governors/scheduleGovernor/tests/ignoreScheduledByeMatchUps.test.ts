import tournamentEngine from '../../../../test/engines/tournamentEngine';
import { addDays, dateRange } from '../../../../utilities/dateTime';
import mocksEngine from '../../../../mocksEngine';
import competitionEngine from '../../../../test/engines/competitionEngine';
import { expect, it } from 'vitest';
import {
  chunkArray,
  intersection,
  extractAttributes as xa,
} from '../../../../utilities';

import { BYE } from '../../../../constants/matchUpStatusConstants';

it('supports pro-scheduling', () => {
  const startDate = '2023-11-28';
  const endDate = addDays(startDate, 3);

  const {
    venueIds: [venueId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32, participantsCount: 28 }],
    venueProfiles: [{ courtsCount: 6 }],
    startDate,
    endDate,
  });

  competitionEngine.setState(tournamentRecord);

  expect(
    tournamentRecord.venues[0].courts[0].dateAvailability[0].startTime
  ).toEqual('07:00');

  const tournamentDateRange = dateRange(startDate, endDate);
  const { rounds } = competitionEngine.getRounds();
  const roundChunks = chunkArray(rounds, 2);

  expect(rounds[0].unscheduledCount).toEqual(12);
  expect(rounds[0].matchUps.length).toEqual(16);
  expect(rounds[0].byeCount).toEqual(4);

  const byeMatchUps = rounds[0].matchUps.filter(
    ({ matchUpStatus }) => matchUpStatus === BYE
  );
  const matchUpContextIds = byeMatchUps.map(
    ({ tournamentId, drawId, matchUpId }) => ({
      tournamentId,
      matchUpId,
      drawId,
    })
  );
  const byeMatchUpIds = byeMatchUps.map(xa('matchUpId'));

  const schedule = {
    scheduledDate: startDate,
    scheduledTime: '08:00',
    venueId,
  };
  let result = competitionEngine.bulkScheduleMatchUps({
    matchUpContextIds,
    schedule,
  });
  expect(result.success).toEqual(true);
  expect(result.scheduled).toEqual(0);

  result = competitionEngine.bulkScheduleMatchUps({
    scheduleByeMatchUps: true,
    matchUpContextIds,
    schedule,
  });
  expect(result.success).toEqual(true);
  expect(result.scheduled).toEqual(4);

  const schedulingProfile = roundChunks.slice(0, 1).map((chunk, i) => ({
    scheduleDate: tournamentDateRange[i],
    venues: [{ venueId, rounds: chunk }],
  }));
  expect(schedulingProfile[0].venues[0].rounds.length).toEqual(2);

  result = competitionEngine.setSchedulingProfile({ schedulingProfile });
  expect(result.success).toEqual(true);

  result = competitionEngine.scheduleProfileRounds({ pro: true });
  expect(result.success).toEqual(true);

  const overlap = intersection(
    result.scheduledMatchUpIds[startDate],
    byeMatchUpIds
  ).length;
  expect(overlap).toEqual(0);

  const byeMatchUpSchedules = tournamentEngine
    .allTournamentMatchUps({ matchUpFilters: { matchUpIds: byeMatchUpIds } })
    .matchUps.map(xa('schedule'));

  expect(byeMatchUpSchedules).toEqual([
    { milliseconds: 0, time: '00:00:00' },
    { milliseconds: 0, time: '00:00:00' },
    { milliseconds: 0, time: '00:00:00' },
    { milliseconds: 0, time: '00:00:00' },
  ]);
});
