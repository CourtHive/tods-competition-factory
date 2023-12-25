import tournamentEngine from '../../engines/syncEngine';
import mocksEngine from '../../../mocksEngine';
import { expect, it } from 'vitest';

import { INVALID_MATCHUP_STATUS } from '../../../constants/errorConditionConstants';
import { IN_PROGRESS } from '../../../constants/matchUpStatusConstants';

it('will not allow an IN_PROGRESS matchUpStatus when there are no participants', () => {
  const startDate = '2022-09-05';
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    venueProfiles: [{ courtsCount: 3 }],
    drawProfiles: [{ drawSize: 16 }],
    startDate,
  });

  tournamentEngine.setState(tournamentRecord);

  const matchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { roundNumbers: [2] },
  }).matchUps;
  const matchUpId = matchUps[0].matchUpId;

  const { courts } = tournamentEngine.getVenuesAndCourts();
  const courtId = courts[0].courtId;

  const result = tournamentEngine.setMatchUpStatus({
    outcome: {
      matchUpStatus: IN_PROGRESS,
    },
    schedule: {
      scheduleDate: startDate,
      scheduleTime: '08:00',
      startTime: '13:00',
      courtId,
    },
    matchUpId,
    drawId,
  });
  expect(result.error).toEqual(INVALID_MATCHUP_STATUS);
});
