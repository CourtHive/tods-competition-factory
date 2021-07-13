import { instanceCount } from '../../../../utilities';
import mocksEngine from '../../../../mocksEngine';
import competitionEngineSync from '../../../sync';

import { DOUBLES, SINGLES } from '../../../../constants/eventConstants';

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

    const matchUpsContextIds = result.dateMatchUps
      .slice(3, 6)
      .map(({ tournamentId, drawId, matchUpId, schedule }) => ({
        tournamentId,
        drawId,
        matchUpId,
        schedule,
      }));

    result = competitionEngine.reorderUpcomingMatchUps({
      matchUpsContextIds,
      firstToLast: true,
    });
    expect(result.success).toEqual(true);

    result = competitionEngine.competitionScheduleMatchUps({
      matchUpFilters,
    });

    const reorderedMatchUpContextIds = result.dateMatchUps
      .slice(3, 6)
      .map(({ matchUpId, schedule }) => ({
        matchUpId,
        scheduledTime: schedule.scheduledTime,
      }));

    // confirm that the first is now the last...
    expect(matchUpsContextIds[0].matchUpId).toEqual(
      reorderedMatchUpContextIds[2].matchUpId
    );

    // the matchUps order has changed but the times are still in the same order
    expect(matchUpsContextIds.map((m) => m.schedule.scheduledTime)).toEqual(
      reorderedMatchUpContextIds.map((m) => m.scheduledTime)
    );

    result = competitionEngine.reorderUpcomingMatchUps({
      matchUpsContextIds: undefined,
    });
    expect(result.error).not.toBeUndefined();

    result = competitionEngine.reorderUpcomingMatchUps({
      matchUpsContextIds: [],
    });
    expect(result.success).toEqual(true);

    matchUpFilters.scheduledDate = '2021-05-06';
    result = competitionEngine.competitionScheduleMatchUps({
      matchUpFilters,
    });
    expect(result.dateMatchUps.length).toEqual(0);

    result = competitionEngine.scheduleMatchUps({
      date: startDate,
      matchUpIds,
    });
    expect(result.scheduledMatchUpIds.length).toEqual(0);
  }
);
