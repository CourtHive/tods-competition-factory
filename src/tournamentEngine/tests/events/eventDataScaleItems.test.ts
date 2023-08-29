import competitionEngine from '../../../competitionEngine/sync';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, test } from 'vitest';

import POLICY_PRIVACY_DEFAULT from '../../../fixtures/policies/POLICY_PRIVACY_DEFAULT';
import { SINGLES } from '../../../constants/matchUpTypes';
import { WTN } from '../../../constants/ratingConstants';

test('ratings values should be present on tournamentParticipants in getEventData', () => {
  const startDate = '2022-02-02';
  const drawId = 'mockDrawId';

  const venueProfiles = [
    {
      venueId: 'e8e4c0b0-216c-426f-bba2-18e16caa74b8', // ensure consistent venueId for courts shared across tournaments
      venueName: 'Club Courts',
      venueAbbreviation: 'CC',
      startTime: '08:00',
      endTime: '20:00',
      courtsCount: 6,
    },
  ];

  const drawProfiles = [
    {
      eventName: `WTN 14-19 SINGLES`,
      category: { ratingType: 'WTN', ratingMin: 14, ratingMax: 19.99 },
      generate: true,
      drawSize: 4,
      drawId,
    },
  ];
  const schedulingProfile = [
    {
      scheduleDate: startDate,
      venues: [
        {
          venueId: venueProfiles[0].venueId,
          rounds: [{ drawId, winnerFinishingPositionRange: '1-2' }],
        },
      ],
    },
  ];
  const personExtensions = [
    { name: 'districtCode', value: 'Z' },
    { name: 'sectionCode', value: '123' },
  ];
  const participantsProfile = {
    withScaleValues: true,
    personExtensions,
  };

  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    scheduleCompletedMatchUps: true,
    completeAllMatchUps: true,
    participantsProfile,
    autoSchedule: true,
    schedulingProfile,
    venueProfiles,
    drawProfiles,
    startDate,
  });

  let {
    matchUps: [mockedMatchUp],
  } = tournamentEngine.allTournamentMatchUps({
    sandboxTournament: tournamentRecord,
    participantsProfile,
  });

  expect(
    mockedMatchUp.sides[0].participant.ratings[SINGLES][0].scaleName
  ).toEqual(WTN);

  ({
    matchUps: [mockedMatchUp],
  } = tournamentEngine.allTournamentMatchUps({
    sandboxTournament: tournamentRecord,
  }));

  expect(mockedMatchUp.sides[0].participant.ratings).toBeUndefined();

  let { eventData } = tournamentEngine.getEventData({
    sandboxTournament: tournamentRecord,
    eventId,
  });
  expect(
    eventData.drawsData[0].structures[0].roundMatchUps[1][0].sides[0]
      .participant.ratings
  ).not.toBeUndefined();
  expect(
    eventData.drawsData[0].structures[0].roundMatchUps[1][0].sides[0]
      .participant.timeItems
  ).not.toBeUndefined();

  // default privacy policy filters out timeItems and ratings
  ({ eventData } = tournamentEngine.getEventData({
    policyDefinitions: POLICY_PRIVACY_DEFAULT,
    sandboxTournament: tournamentRecord,
    eventId,
  }));
  expect(
    eventData.drawsData[0].structures[0].roundMatchUps[1][0].sides[0]
      .participant.ratings
  ).toBeUndefined();
  expect(
    eventData.drawsData[0].structures[0].roundMatchUps[1][0].sides[0]
      .participant.timeItems
  ).toBeUndefined();

  competitionEngine.setState(tournamentRecord);
  const result = competitionEngine.competitionScheduleMatchUps({
    participantsProfile,
  });
  expect(
    result.completedMatchUps[0].sides[0].participant.ratings.SINGLES[0]
      .scaleName
  ).toEqual(WTN);
});
