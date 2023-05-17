import { visualizeScheduledMatchUps } from '../../../../global/testHarness/testUtilities/visualizeScheduledMatchUps';
import { getMatchUpIds } from '../../../../global/functions/extractors';
import { hasSchedule } from '../scheduleMatchUps/hasSchedule';
import { instanceCount } from '../../../../utilities';
import mocksEngine from '../../../../mocksEngine';
import competitionEngineSync from '../../../sync';
import { expect, test } from 'vitest';

import POLICY_SCHEDULING_NO_DAILY_LIMITS from '../../../../fixtures/policies/POLICY_SCHEDULING_NO_DAILY_LIMITS';
import { DOUBLES, SINGLES } from '../../../../constants/eventConstants';

test.each([competitionEngineSync])(
  'correctly enumerates participantProfiles for { eventType: DOUBLES }',
  async (competitionEngine) => {
    const drawProfiles = [{ drawSize: 16, eventType: DOUBLES }];
    const venueProfiles = [{ courtsCount: 3 }];

    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      startDate: '2021-05-05',
      endDate: '2021-05-07',
      venueProfiles,
      drawProfiles,
    });

    competitionEngine.setState([tournamentRecord]);
    const { upcomingMatchUps } = competitionEngine.competitionMatchUps();
    const { startDate } = competitionEngine.getCompetitionDateRange();

    const matchUpIds = getMatchUpIds(upcomingMatchUps);
    expect(
      instanceCount(upcomingMatchUps.map(({ matchUpType }) => matchUpType))
    ).toEqual({ DOUBLES: 8 });

    let result = competitionEngine.scheduleMatchUps({
      scheduleDate: startDate,
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
      { idPrefix: 'dbl', drawId: 'dubs', drawSize: 16, eventType: DOUBLES },
      { idPrefix: 'sgl', drawId: 'sing', drawSize: 64, eventType: SINGLES },
    ];
    const venueProfiles = [{ courtsCount: 3 }];

    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      policyDefinitions: POLICY_SCHEDULING_NO_DAILY_LIMITS,
      startDate: '2021-05-05',
      endDate: '2021-05-07',
      venueProfiles,
      drawProfiles,
    });

    competitionEngine.setState([tournamentRecord]);
    const { upcomingMatchUps } = competitionEngine.competitionMatchUps();
    const { startDate } = competitionEngine.getCompetitionDateRange();

    const matchUpIds = getMatchUpIds(upcomingMatchUps);
    expect(
      instanceCount(upcomingMatchUps.map(({ matchUpType }) => matchUpType))
    ).toEqual({ DOUBLES: 8, SINGLES: 32 });

    let result = competitionEngine.scheduleMatchUps({
      scheduleDate: startDate,
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
      usePublishState: true,
      matchUpFilters,
    });
    expect(result.dateMatchUps.length).toEqual(0);

    result = competitionEngine.publishOrderOfPlay();
    expect(result.success).toEqual(true);

    result = competitionEngine.competitionScheduleMatchUps({
      usePublishState: true,
      matchUpFilters,
    });
    expect(result.dateMatchUps.length).toEqual(23);

    result = competitionEngine.unPublishOrderOfPlay();
    expect(result.success).toEqual(true);

    result = competitionEngine.competitionScheduleMatchUps({
      usePublishState: true,
      matchUpFilters,
    });
    expect(result.dateMatchUps.length).toEqual(0);

    result = competitionEngine.publishOrderOfPlay();
    expect(result.success).toEqual(true);

    result = competitionEngine.competitionScheduleMatchUps({
      matchUpFilters,
    });
    expect(result.dateMatchUps.length).toEqual(23);

    const matchUpsContextIds = result.dateMatchUps
      .slice(3, 6)
      .map(({ tournamentId, drawId, matchUpId, schedule }) => ({
        tournamentId,
        matchUpId,
        schedule,
        drawId,
      }));

    result = competitionEngine.reorderUpcomingMatchUps({
      matchUpsContextIds,
      firstToLast: true,
    });
    expect(result.success).toEqual(true);

    result = competitionEngine.competitionScheduleMatchUps({
      matchUpFilters,
    });
    visualizeScheduledMatchUps({
      scheduledMatchUps: result.dateMatchUps,
      showGlobalLog: false,
    });

    result = competitionEngine.competitionScheduleMatchUps({
      nextMatchUps: true,
    });
    expect(
      result.dateMatchUps.find((m) => m.winnerMatchUpId && !m.readyToScore)
        ?.potentialParticipants.length
    ).toBeGreaterThan(1);

    const { matchUps } = competitionEngine.allCompetitionMatchUps({
      afterRecoveryTimes: true,
    });
    matchUps.filter(hasSchedule).forEach(({ schedule }) => {
      expect(schedule.averageMinutes).toBeGreaterThan(0);
      expect(schedule.recoveryMinutes).toBeGreaterThan(0);
    });

    const reorderedMatchUpContextIds = result.dateMatchUps
      .slice(3, 6)
      .map(({ matchUpId, schedule }) => ({
        scheduledTime: schedule.scheduledTime,
        matchUpId,
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
      scheduleDate: startDate,
      matchUpIds,
    });
    expect(result.scheduledMatchUpIds.length).toEqual(0);
  }
);
