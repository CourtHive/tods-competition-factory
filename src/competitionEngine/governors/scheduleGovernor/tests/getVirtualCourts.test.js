import { visualizeScheduledMatchUps } from '../../../../global/testHarness/testUtilities/visualizeScheduledMatchUps';
import { hasSchedule } from '../scheduleMatchUps/hasSchedule';
import { extractDate } from '../../../../utilities/dateTime';
import { mocksEngine, competitionEngine } from '../../../..';

import POLICY_SCHEDULING_NO_DAILY_LIMITS from '../../../../fixtures/policies/POLICY_SCHEDULING_NO_DAILY_LIMITS';

it('can create virtual courts with overlapping bookings', () => {
  const drawId = 'drawId';
  const venueId = 'venueId';
  const startDate = extractDate(new Date().toISOString());
  const drawProfiles = [{ drawId, drawSize: 32 }];
  const venueProfiles = [{ venueId, courtsCount: 31, startTime: '08:00' }];
  const schedulingProfile = [
    {
      scheduleDate: startDate,
      venues: [
        {
          venueId,
          rounds: [
            { drawId, winnerFinishingPositionRange: '1-16' },
            { drawId, winnerFinishingPositionRange: '1-8' },
            { drawId, winnerFinishingPositionRange: '1-4' },
          ],
        },
      ],
    },
  ];
  const { tournamentRecord, schedulerResult } =
    mocksEngine.generateTournamentRecord({
      policyDefinitions: POLICY_SCHEDULING_NO_DAILY_LIMITS,
      autoSchedule: true,
      schedulingProfile,
      venueProfiles,
      drawProfiles,
      startDate,
    });
  competitionEngine.setState(tournamentRecord);
  console.log({ startDate, schedulerResult });

  const { matchUps } = competitionEngine.allCompetitionMatchUps();
  const scheduledMatchUps = matchUps.filter(hasSchedule);

  visualizeScheduledMatchUps({ scheduledMatchUps, showGlobalLog: true });
});
