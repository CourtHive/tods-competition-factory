import tournamentEngine from '../../../../tournamentEngine/sync';
import { instanceCount } from '../../../../utilities';
import mocksEngine from '../../../../mocksEngine';
import competitionEngineSync from '../../../sync';

import { DOUBLES, SINGLES } from '../../../../constants/eventConstants';

// import competitionEngineAsync from '../../../async';
// const asyncCompetitionEngine = competitionEngineAsync();

test.each([competitionEngineSync])(
  'correctly enumerates participantProfiles for { eventType: DOUBLES }',
  async (competitionEngine) => {
    const drawProfiles = [{ drawSize: 16, eventType: DOUBLES }];
    const venueProfiles = [{ courtsCount: 3 }];

    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      startDate: '2021-05-05',
      endDate: '2021-05-07',
      drawProfiles,
      venueProfiles,
    });

    competitionEngine.setState([tournamentRecord]);
    const { upcomingMatchUps } = competitionEngine.competitionMatchUps();
    const { startDate } = competitionEngine.getCompetitionDateRange();

    const matchUpIds = upcomingMatchUps.map(({ matchUpId }) => matchUpId);
    expect(
      instanceCount(upcomingMatchUps.map(({ matchUpType }) => matchUpType))
    ).toEqual({ DOUBLES: 8 });

    let result = competitionEngine.scheduleMatchUps({
      date: startDate,
      matchUpIds,
    });
    Object.values(result.individualParticipantProfiles).forEach(
      (participantProfile) =>
        expect(participantProfile.counters).toEqual({ DOUBLES: 1, total: 1 })
    );
    expect(result.scheduledMatchUpIds.length).toEqual(8);
    expect(result.success).toEqual(true);
  }
);

test.each([competitionEngineSync])(
  'auto schedules venue if only one venue provided',
  async (competitionEngine) => {
    const drawProfiles = [
      { drawSize: 16, eventType: DOUBLES },
      { drawSize: 64, eventType: SINGLES },
    ];
    const venueProfiles = [{ courtsCount: 3 }];

    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      startDate: '2021-05-05',
      endDate: '2021-05-07',
      drawProfiles,
      venueProfiles,
    });

    competitionEngine.setState([tournamentRecord]);
    const { upcomingMatchUps } = competitionEngine.competitionMatchUps();
    const { startDate } = competitionEngine.getCompetitionDateRange();

    const matchUpIds = upcomingMatchUps.map(({ matchUpId }) => matchUpId);
    expect(
      instanceCount(upcomingMatchUps.map(({ matchUpType }) => matchUpType))
    ).toEqual({ DOUBLES: 8, SINGLES: 32 });

    let result = competitionEngine.scheduleMatchUps({
      date: startDate,
      matchUpIds,
    });
    expect(result.success).toEqual(true);
    expect(result.scheduledMatchUpIds.length).toEqual(23);
    expect(
      Object.values(result.individualParticipantProfiles).some(
        (profile) =>
          profile.counters.DOUBLES === 1 && profile.counters.SINGLES === 1
      )
    ).toEqual(true);

    const matchUpFilters = { scheduledDate: '2021-05-05' };
    result = competitionEngine.competitionScheduleMatchUps({
      matchUpFilters,
    });
    expect(result.dateMatchUps.length).toEqual(23);

    matchUpFilters.scheduledDate = '2021-05-06';
    result = competitionEngine.competitionScheduleMatchUps({
      matchUpFilters,
    });
    expect(result.dateMatchUps.length).toEqual(0);

    result = competitionEngine.scheduleMatchUps({
      date: startDate,
      matchUpIds,
    });
    expect(result.error).not.toBeUndefined();
  }
);

test.each([
  [competitionEngineSync, 16, 8, 2, [15]],
  [competitionEngineSync, 16, 16, 3, [21]],
  [competitionEngineSync, 16, 32, 4, [30]],
])(
  'sorts scheduled matchUps according to schedulingProfile',
  async (
    competitionEngine,
    drawSize1,
    drawSize2,
    courtsCount,
    scheduledRange
  ) => {
    const drawProfiles = [
      { drawSize: drawSize1, drawName: 'Draw 1' },
      { drawSize: drawSize2, drawName: 'Draw 2' },
    ];
    const venueProfiles = [
      {
        venueName: 'venue 1',
        startTime: '08:00',
        endTime: '20:00',
        courtsCount,
      },
    ];

    const startDate = '2022-01-01';
    const endDate = '2022-01-07';
    let result = mocksEngine.generateTournamentRecord({
      drawProfiles,
      venueProfiles,
      startDate,
      endDate,
    });

    const {
      tournamentRecord,
      drawIds,
      venueIds: [venueId],
    } = result;
    await competitionEngine.setState(tournamentRecord);

    // tournamentEngine is used to retreive the events
    tournamentEngine.setState(tournamentRecord);
    const { tournamentId } = tournamentRecord;

    // add first round of each draw to scheduling profile
    for (const drawId of drawIds) {
      const {
        event: { eventId },
        drawDefinition: {
          structures: [{ structureId }],
        },
      } = tournamentEngine.getEvent({ drawId });
      result = await competitionEngine.addSchedulingProfileRound({
        scheduleDate: startDate,
        venueId,
        round: { tournamentId, eventId, drawId, structureId, roundNumber: 1 },
      });
      expect(result.success).toEqual(true);
    }

    // add second round of each draw to scheduling profile
    for (const drawId of drawIds) {
      const {
        event: { eventId },
        drawDefinition: {
          structures: [{ structureId }],
        },
      } = tournamentEngine.getEvent({ drawId });
      result = await competitionEngine.addSchedulingProfileRound({
        scheduleDate: startDate,
        venueId,
        round: { tournamentId, eventId, drawId, structureId, roundNumber: 2 },
      });
      expect(result.success).toEqual(true);
    }

    result = await competitionEngine.scheduleProfileRounds({
      date: startDate,
    });

    expect(result.success).toEqual(true);
    expect(result.scheduledDates).toEqual([startDate]);
    expect(scheduledRange.includes(result.scheduledMatchUpIds.length)).toEqual(
      true
    );

    const matchUpFilters = { scheduledDate: startDate };
    result = await competitionEngine.competitionScheduleMatchUps({
      matchUpFilters,
    });

    // this is a list of scheduled matchUps which has been sorted according to the schedulingProfile
    // the difference here is that matchUps were first retrieved from each drawDefinition, whereas
    // scheduledTimeOrder is an ordered array produced as scheduledTimes are assigned
    const sortedDateMatchUps = result.dateMatchUps.map(
      ({ drawId, roundNumber }) => [drawId, roundNumber]
    );
    expect(scheduledRange.includes(sortedDateMatchUps.length)).toEqual(true);
    // TODO: 3rd test case is not properly sorted
    // TODO: number of scheduled matches in 3rd test case occasionally varies, presumably because of player conflicts
  }
);
