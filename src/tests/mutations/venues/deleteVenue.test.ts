import mocksEngine from '../../../assemblies/engines/mock';
import { extractDate } from '../../../tools/dateTime';
import tournamentEngine from '../../engines/syncEngine';
import { expect, it } from 'vitest';

import POLICY_SCHEDULING_NO_DAILY_LIMITS from '../../../fixtures/policies/POLICY_SCHEDULING_NO_DAILY_LIMITS';
import { SCHEDULED_MATCHUPS } from '../../../constants/errorConditionConstants';

it('thows an error if a venue has scheduled matchUps', () => {
  const drawId = 'drawId';
  const venueId = 'venueId';
  const startDate = extractDate(new Date().toISOString());
  const drawProfiles = [{ idPrefix: 'm', drawId, drawSize: 32 }];
  const venueProfiles = [
    {
      venueAbbreviation: 'VNU',
      courtsCount: 8,
      idPrefix: 'c',
      venueId,
    },
  ];
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
            { drawId, winnerFinishingPositionRange: '1-2' },
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

  expect(schedulerResult.scheduledMatchUpIds[startDate].length).toEqual(30);

  tournamentEngine.setState(tournamentRecord);

  const myCourts = { venueName: 'My Courts' };
  let result = tournamentEngine.addVenue({ venue: myCourts });
  expect(result.success).toEqual(true);

  result = tournamentEngine.deleteVenue({ venueId: result.venue.venueId });
  expect(result.success).toEqual(true);

  result = tournamentEngine.deleteVenue({ venueId });
  expect(result.error).toEqual(SCHEDULED_MATCHUPS);

  result = tournamentEngine.competitionScheduleMatchUps({ matchUpFilters: { scheduledDate: startDate } });
  const matchUpId = result.dateMatchUps[0].matchUpId;

  result = tournamentEngine.assignMatchUpCourt({
    courtDayDate: startDate,
    courtId: 'c-1',
    matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  // ensure that venue addresses can be modified when matchUps have been assigned to courts
  result = tournamentEngine.modifyVenue({
    venueId,
    modifications: {
      addresses: [
        {
          latitude: 51.4344827,
          longitude: -0.216108,
        },
      ],
    },
  });
  expect(result.success).toEqual(true);
});
