import { visualizeScheduledMatchUps } from '../../../../global/testHarness/testUtilities/visualizeScheduledMatchUps';
import { hasSchedule } from '../scheduleMatchUps/hasSchedule';
import { extractDate } from '../../../../utilities/dateTime';
import { mocksEngine, competitionEngine } from '../../../..';

import POLICY_SCHEDULING_NO_DAILY_LIMITS from '../../../../fixtures/policies/POLICY_SCHEDULING_NO_DAILY_LIMITS';

const showGlobalLog = false;

it('can create virtual courts with overlapping bookings', () => {
  const drawId = 'drawId';
  const venueId = 'venueId';
  const startTime = '08:00';
  const endTime = '20:00';
  const startDate = extractDate(new Date().toISOString());
  const drawProfiles = [{ idPrefix: 'm', drawId, drawSize: 32 }];
  const venueProfiles = [{ venueId, courtsCount: 8, startTime, endTime }];
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

  const { matchUps } = competitionEngine.allCompetitionMatchUps();
  const scheduledMatchUps = matchUps.filter(hasSchedule);

  visualizeScheduledMatchUps({ scheduledMatchUps, showGlobalLog });

  const { bookings, relevantMatchUps } = competitionEngine.generateBookings({
    scheduleDate: startDate,
    venueIds: [venueId],
    matchUps,
  });

  const scheduledMatchUpsCount =
    schedulerResult.scheduledMatchUpIds[startDate].length;
  expect(relevantMatchUps.length).toEqual(scheduledMatchUpsCount);
  expect(bookings.length).toEqual(scheduledMatchUpsCount);

  const { courts } = competitionEngine.getVenuesAndCourts({
    venueIds: [venueId],
  });

  // const { virtualCourts } = competitionEngine.generateVirtualCourts({
  competitionEngine.generateVirtualCourts({
    scheduleDate: startDate,
    bookings,
    courts,
  });

  // console.log(result);
});
