import mocksEngine from '../../../assemblies/engines/mock';
import competitionEngine from '../../engines/syncEngine';
import { expect, it } from 'vitest';

import POLICY_SCHEDULING_NO_DAILY_LIMITS from '../../../fixtures/policies/POLICY_SCHEDULING_NO_DAILY_LIMITS';
import { Tournament } from '../../../types/tournamentTypes';
import { PUBLIC } from '../../../constants/timeItemConstants';

it('can publish order of play for specified days', () => {
  const startDate = '2022-01-01';
  const day2Date = '2022-01-02';
  const endDate = '2022-01-07';
  const firstVenueId = 'first';
  const secondVenueId = 'second';
  const venueProfiles = [
    {
      venueId: firstVenueId,
      venueName: 'venue 1',
      startTime: '08:00',
      endTime: '20:00',
      courtsCount: 4,
    },
    {
      venueId: secondVenueId,
      venueName: 'venue 2',
      startTime: '08:00',
      endTime: '20:00',
      courtsCount: 2,
    },
  ];

  const drawProfiles = [
    {
      drawName: 'U16 Male Singles',
      participantsCount: 32,
      idPrefix: 'M16',
      drawId: 'idM16',
      drawSize: 32,
    },
  ];
  const schedulingProfile = [
    {
      scheduleDate: startDate,
      venues: [
        {
          venueId: firstVenueId,
          rounds: [
            {
              drawId: 'idM16',
              winnerFinishingPositionRange: '1-16',
              roundSegment: { segmentNumber: 1, segmentsCount: 2 },
            },
            {
              drawId: 'idM16',
              winnerFinishingPositionRange: '1-8',
              roundSegment: { segmentNumber: 1, segmentsCount: 2 },
            },
          ],
        },
        {
          venueId: secondVenueId,
          rounds: [
            {
              drawId: 'idM16',
              winnerFinishingPositionRange: '1-16',
              roundSegment: { segmentNumber: 2, segmentsCount: 2 },
            },
            {
              drawId: 'idM16',
              winnerFinishingPositionRange: '1-8',
              roundSegment: { segmentNumber: 2, segmentsCount: 2 },
            },
          ],
        },
      ],
    },
    {
      scheduleDate: day2Date,
      venues: [
        {
          venueId: firstVenueId,
          rounds: [
            {
              drawId: 'idM16',
              winnerFinishingPositionRange: '1-4',
            },
            {
              drawId: 'idM16',
              winnerFinishingPositionRange: '1-2',
            },
          ],
        },
      ],
    },
  ];

  let result = mocksEngine.generateTournamentRecord({
    policyDefinitions: POLICY_SCHEDULING_NO_DAILY_LIMITS,
    autoSchedule: true,
    schedulingProfile,
    venueProfiles,
    drawProfiles,
    startDate,
    endDate,
  });

  competitionEngine.setState(result.tournamentRecord);

  let publishState = competitionEngine.getPublishState().publishState;
  expect(publishState.tournament?.orderOfPlay?.published).toBeUndefined();

  result = competitionEngine.publishOrderOfPlay();
  expect(result.success).toEqual(true);

  result = competitionEngine.getState();
  let tournamentRecord: Tournament = Object.values(result.tournamentRecords)[0] as Tournament;
  expect(tournamentRecord.timeItems?.[1].itemValue[PUBLIC].orderOfPlay).not.toBeUndefined();

  publishState = competitionEngine.getPublishState().publishState;
  expect(publishState.tournament.orderOfPlay.published).toEqual(true);

  result = competitionEngine.unPublishOrderOfPlay({
    removePriorValues: false,
  });
  expect(result.success).toEqual(true);

  result = competitionEngine.getState();
  tournamentRecord = Object.values(result.tournamentRecords)[0] as Tournament;
  expect(tournamentRecord.timeItems?.length).toEqual(3);
  expect(tournamentRecord.timeItems?.[2].itemValue).toEqual({ [PUBLIC]: {} });

  result = competitionEngine.unPublishOrderOfPlay();
  expect(result.success).toEqual(true);

  result = competitionEngine.getState();
  tournamentRecord = Object.values(result.tournamentRecords)[0] as Tournament;
  expect(tournamentRecord.timeItems?.length).toEqual(2);
  expect(tournamentRecord.timeItems?.[1].itemValue).toEqual({ [PUBLIC]: {} });
});
