import { visualizeScheduledMatchUps } from '../../testHarness/testUtilities/visualizeScheduledMatchUps';
import { hasSchedule } from '@Mutate/matchUps/schedule/scheduleMatchUps/hasSchedule';
import mocksEngine from '@Assemblies/engines/mock';
import { extractDate } from '@Tools/dateTime';
import tournamentEngine from '@Engines/syncEngine';
import { expect, it } from 'vitest';

import POLICY_SCHEDULING_NO_DAILY_LIMITS from '@Fixtures/policies/POLICY_SCHEDULING_NO_DAILY_LIMITS';

it('can schedule all matchUps in first round with only drawId', () => {
  const drawId = 'drawId';
  const venueId = 'venueId';
  const startTime = '08:00';
  const endTime = '20:00';
  const startDate = extractDate(new Date().toISOString());
  const drawProfiles = [{ idPrefix: 'm', drawId, drawSize: 32 }];
  const venueProfiles = [
    {
      venueId,
      venueName: 'Venue',
      venueAbbreviation: 'VNU',
      courtNames: ['One', 'Two', 'Three'],
      courtIds: ['c1', 'c2', 'c3'],
      courtsCount: 8,
      startTime,
      endTime,
    },
  ];
  const schedulingProfile = [
    {
      scheduleDate: startDate,
      venues: [
        {
          venueId,
          rounds: [
            { drawId, roundNumber: 1 },
            { drawId, roundNumber: 2 },
          ],
        },
      ],
    },
  ];
  const { tournamentRecord, schedulerResult } = mocksEngine.generateTournamentRecord({
    policyDefinitions: POLICY_SCHEDULING_NO_DAILY_LIMITS,
    autoSchedule: true,
    schedulingProfile,
    venueProfiles,
    drawProfiles,
    startDate,
  });

  tournamentEngine.setState(tournamentRecord);
  expect(Object.values(schedulerResult.matchUpScheduleTimes).length).toEqual(24);

  const { matchUps } = tournamentEngine.allCompetitionMatchUps();
  const scheduledMatchUps = matchUps?.filter(hasSchedule);
  expect(scheduledMatchUps.length).toEqual(24);
  const schedule = scheduledMatchUps[0].schedule;
  expect(schedule.venueAbbreviation).toEqual('VNU');

  visualizeScheduledMatchUps({ scheduledMatchUps, showGlobalLog: false });
});
