import { extractDate } from '../../../utilities/dateTime';
import tournamentEngine from '../../sync';
import mocksEngine from '../../../mocksEngine';
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

  const { tournamentRecord, schedulerResult } =
    mocksEngine.generateTournamentRecord({
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
});
