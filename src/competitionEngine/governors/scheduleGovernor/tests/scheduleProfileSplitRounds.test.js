import { visualizeScheduledMatchUps } from '../../../../global/testHarness/testUtilities/visualizeScheduledMatchUps';
import { getScheduledRoundsDetails } from '../schedulingProfile/getScheduledRoundsDetails';
import tournamentEngine from '../../../../tournamentEngine/sync';
import { hasSchedule } from '../scheduleMatchUps/hasSchedule';
import mocksEngine from '../../../../mocksEngine';
import competitionEngine from '../../../sync';
import { expect, it } from 'vitest';

import POLICY_SCHEDULING_NO_DAILY_LIMITS from '../../../../fixtures/policies/POLICY_SCHEDULING_NO_DAILY_LIMITS';
import { APPLIED_POLICIES } from '../../../../constants/extensionConstants';

const showGlobalLog = false;

it('Can split rounds across multiple venues', () => {
  const startDate = '2022-01-01';
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

  tournamentEngine.setState(result.tournamentRecord);

  const { extension } = tournamentEngine.findTournamentExtension({
    name: APPLIED_POLICIES,
  });
  expect(extension.name).toEqual(APPLIED_POLICIES);

  const { schedulingProfile: attachedSchedulingProfile } =
    tournamentEngine.getSchedulingProfile();

  expect(attachedSchedulingProfile[0].venues[0].rounds[0].roundNumber).toEqual(
    1
  );
  expect(attachedSchedulingProfile[0].venues[1].rounds[0].roundNumber).toEqual(
    1
  );
  expect(
    attachedSchedulingProfile[0].venues[0].rounds[0].roundSegment.segmentNumber
  ).toEqual(1);
  expect(
    attachedSchedulingProfile[0].venues[1].rounds[0].roundSegment.segmentNumber
  ).toEqual(2);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  const scheduledMatchUps = matchUps.filter(hasSchedule);

  visualizeScheduledMatchUps({ scheduledMatchUps, showGlobalLog });
});

it('Can split rounds across multiple venues', () => {
  const startDate = '2022-01-01';
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
            },
          ],
        },
        {
          venueId: secondVenueId,
          rounds: [
            {
              drawId: 'idM16',
              winnerFinishingPositionRange: '1-8',
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

  tournamentEngine.setState(result.tournamentRecord);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  const scheduledMatchUps = matchUps.filter(hasSchedule);

  visualizeScheduledMatchUps({ scheduledMatchUps, showGlobalLog });

  expect(
    Object.keys(result.schedulerResult.matchUpScheduleTimes).length
  ).toEqual(24);
  expect(
    result.schedulerResult.skippedScheduleTimes[startDate].second.length
  ).toEqual(0);
  expect(
    result.schedulerResult.scheduleTimesRemaining[startDate].first.length
  ).toEqual(14);
  expect(
    result.schedulerResult.scheduleTimesRemaining[startDate].second.length
  ).toEqual(7);
});

it('Can split rounds with multiple BYEs', () => {
  const startDate = '2022-01-01';
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
      participantsCount: 18,
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

  tournamentEngine.setState(result.tournamentRecord);

  const { extension } = tournamentEngine.findTournamentExtension({
    name: APPLIED_POLICIES,
  });
  expect(extension.name).toEqual(APPLIED_POLICIES);

  const { schedulingProfile: attachedSchedulingProfile } =
    tournamentEngine.getSchedulingProfile();

  const venues = attachedSchedulingProfile[0].venues;
  expect(venues[0].rounds[0].roundNumber).toEqual(1);
  expect(venues[1].rounds[0].roundNumber).toEqual(1);
  expect(venues[0].rounds[0].roundSegment.segmentNumber).toEqual(1);
  expect(venues[1].rounds[0].roundSegment.segmentNumber).toEqual(2);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  const scheduledMatchUps = matchUps.filter(hasSchedule);
  expect(scheduledMatchUps.length).toEqual(2);
  expect(scheduledMatchUps[0].schedule.venueId).not.toEqual(
    scheduledMatchUps[1].schedule.venueId
  );

  visualizeScheduledMatchUps({ scheduledMatchUps, showGlobalLog });

  const { tournamentRecords } = competitionEngine.getState();

  for (const index of [0, 1]) {
    const { scheduledRoundsDetails } = getScheduledRoundsDetails({
      tournamentRecords,
      rounds: venues[index].rounds,
    });
    expect(scheduledRoundsDetails[0].matchUpIds.length).toEqual(1);
  }
});
