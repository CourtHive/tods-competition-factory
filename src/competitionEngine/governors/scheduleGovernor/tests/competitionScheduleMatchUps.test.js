import tournamentEngine from '../../../../tournamentEngine/sync';
import mocksEngine from '../../../../mocksEngine';
import competitionEngineSync from '../../../sync';
import competitionEngineAsync from '../../../async';

const asyncCompetitionEngine = competitionEngineAsync();

test.each([competitionEngineSync])(
  'auto schedules venue if only one venue provided',
  async (competitionEngine) => {
    const drawProfiles = [{ drawSize: 16 }, { drawSize: 64 }];
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

    let result = competitionEngine.scheduleMatchUps({
      date: startDate,
      matchUpIds,
    });
    expect(result.success).toEqual(true);
    expect(result.scheduledMatchUpIds.length).toEqual(23);

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

test.each([competitionEngineSync, asyncCompetitionEngine])(
  'sorts scheduled matchUps according to schedulingProfile',
  async (competitionEngine) => {
    const drawProfiles = [
      { drawSize: 8, drawName: 'Draw 1' },
      { drawSize: 16, drawName: 'Draw 2' },
    ];
    const venueProfiles = [
      {
        venueName: 'venue 1',
        startTime: '08:00',
        endTime: '18:00',
        courtsCount: 6,
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

    // this is the list of scheduledTimes in the order in which they were assigned to matchUps
    const scheduledTimeOrder = result.scheduledMatchUpIds.map(
      ({ scheduledTime }) => scheduledTime
    );
    expect(result.success).toEqual(true);
    expect(result.scheduledDates).toEqual([startDate]);
    expect(result.scheduledMatchUpIds.length).toEqual(18);

    const matchUpFilters = { scheduledDate: startDate };
    result = await competitionEngine.competitionScheduleMatchUps({
      matchUpFilters,
    });

    // this is a list of scheduled matchUps which has been sorted according to the schedulingProfile
    // the difference here is that matchUps were first retrieved from each drawDefinition, whereas
    // scheduledTimeOrder is an ordered array produced as scheduledTimes are assigned
    const sortedDateMatchUps = result.dateMatchUps.map(
      ({ schedule }) => schedule.scheduledTime
    );

    // This proves that the sorted dateMatchUps can faithfully reflect the assigned order
    expect(scheduledTimeOrder).toEqual(sortedDateMatchUps);
  }
);
