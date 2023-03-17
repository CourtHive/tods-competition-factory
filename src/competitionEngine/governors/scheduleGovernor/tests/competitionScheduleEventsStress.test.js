import { mocksEngine, tournamentEngine } from '../../../..';
import competitionEngine from '../../../sync';
import { expect, test } from 'vitest';

/*
used for benchmarking when optimizing competitionMatchUps
*/
test.skip('competitionSchedule performance 30 events', () => {
  const venueId = 'venueId';
  const venueProfiles = [{ venueId, courtsCount: 40 }];
  // prettier-ignore
  const drawProfiles = [
    { drawId: 'd1', drawSize: 16, uniqueParticipants: true }, { drawId: 'd2', drawSize: 16, uniqueParticipants: true },
    { drawId: 'd3', drawSize: 16, uniqueParticipants: true }, { drawId: 'd4', drawSize: 16, uniqueParticipants: true },
    { drawId: 'd5', drawSize: 16, uniqueParticipants: true }, { drawId: 'd6', drawSize: 16, uniqueParticipants: true },
    { drawId: 'd7', drawSize: 16, uniqueParticipants: true }, { drawId: 'd8', drawSize: 16, uniqueParticipants: true },
    { drawId: 'd9', drawSize: 16, uniqueParticipants: true }, { drawId: 'd10', drawSize: 16, uniqueParticipants: true },
    { drawId: 'd11', drawSize: 16, uniqueParticipants: true }, { drawId: 'd12', drawSize: 16, uniqueParticipants: true },
    { drawId: 'd13', drawSize: 16, uniqueParticipants: true }, { drawId: 'd14', drawSize: 16, uniqueParticipants: true },
    { drawId: 'd15', drawSize: 16, uniqueParticipants: true }, { drawId: 'd16', drawSize: 16, uniqueParticipants: true },
    { drawId: 'd17', drawSize: 16, uniqueParticipants: true }, { drawId: 'd18', drawSize: 16, uniqueParticipants: true },
    { drawId: 'd19', drawSize: 16, uniqueParticipants: true }, { drawId: 'd20', drawSize: 16, uniqueParticipants: true },
    { drawId: 'd21', drawSize: 16, uniqueParticipants: true }, { drawId: 'd22', drawSize: 16, uniqueParticipants: true },
    { drawId: 'd23', drawSize: 16, uniqueParticipants: true }, { drawId: 'd24', drawSize: 16, uniqueParticipants: true },
    { drawId: 'd25', drawSize: 16, uniqueParticipants: true }, { drawId: 'd26', drawSize: 16, uniqueParticipants: true },
    { drawId: 'd27', drawSize: 16, uniqueParticipants: true }, { drawId: 'd28', drawSize: 16, uniqueParticipants: true },
    { drawId: 'd29', drawSize: 16, uniqueParticipants: true }, { drawId: 'd30', drawSize: 16, uniqueParticipants: true } ];

  const startDate = '2022-01-01';

  const schedulingProfile = [
    {
      scheduleDate: startDate,
      venues: [
        {
          venueId,
          rounds: [
            { drawId: 'd1', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd2', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd3', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd4', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd5', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd6', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd7', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd8', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd9', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd10', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd11', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd12', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd13', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd14', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd15', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd16', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd17', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd18', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd19', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd20', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd21', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd22', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd23', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd24', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd25', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd26', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd27', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd28', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd29', winnerFinishingPositionRange: '1-8' },
            { drawId: 'd30', winnerFinishingPositionRange: '1-8' },
          ],
        },
      ],
    },
  ];

  const { scheduledRounds, tournamentRecord } =
    mocksEngine.generateTournamentRecord({
      autoSchedule: true,
      schedulingProfile,
      venueProfiles,
      drawProfiles,
      startDate,
    });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result).not.toBeUndefined();

  expect(scheduledRounds.length).toEqual(30);

  const matchUpFilters = { scheduledDate: startDate };
  result = competitionEngine.competitionScheduleMatchUps({
    matchUpFilters,
  });
  expect(result.dateMatchUps.length).toEqual(240);
});

test.skip('competitionSchedule performance 4 events', () => {
  const venueId = 'venueId';
  const venueProfiles = [{ venueId, courtsCount: 40 }];
  // prettier-ignore
  const drawProfiles = [
    { drawId: 'd1', drawSize: 128, uniqueParticipants: true }, { drawId: 'd2', drawSize: 128, uniqueParticipants: true },
    { drawId: 'd3', drawSize: 128, uniqueParticipants: true }, { drawId: 'd4', drawSize: 128, uniqueParticipants: true }];

  const startDate = '2022-01-01';

  const schedulingProfile = [
    {
      scheduleDate: startDate,
      venues: [
        {
          venueId,
          rounds: [
            { drawId: 'd1', winnerFinishingPositionRange: '1-64' },
            { drawId: 'd2', winnerFinishingPositionRange: '1-64' },
            { drawId: 'd3', winnerFinishingPositionRange: '1-64' },
            { drawId: 'd4', winnerFinishingPositionRange: '1-64' },
          ],
        },
      ],
    },
  ];
  const { scheduledRounds, tournamentRecord } =
    mocksEngine.generateTournamentRecord({
      autoSchedule: true,
      schedulingProfile,
      venueProfiles,
      drawProfiles,
      startDate,
    });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result).not.toBeUndefined();

  expect(scheduledRounds.length).toEqual(4);

  const matchUpFilters = { scheduledDate: startDate };
  result = competitionEngine.competitionScheduleMatchUps({
    matchUpFilters,
  });
  expect(result.dateMatchUps.length).toEqual(256);
});

test('mocksEngine can autoschedule', () => {
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
  const participantsProfile = { personExtensions };

  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    scheduleCompletedMatchUps: true,
    completeAllMatchUps: true,
    participantsProfile,
    autoSchedule: true,
    schedulingProfile,
    venueProfiles,
    drawProfiles,
    startDate,
  });

  const {
    matchUps: [mockedMatchUp],
  } = tournamentEngine.setState(tournamentRecord).allTournamentMatchUps();

  expect(Object.keys(mockedMatchUp.schedule).length).toBeGreaterThan(0);
});
