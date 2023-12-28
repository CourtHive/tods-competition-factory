import { visualizeScheduledMatchUps } from '../../../global/testHarness/testUtilities/visualizeScheduledMatchUps';
import { hasSchedule } from '../../../mutate/matchUps/schedule/scheduleMatchUps/hasSchedule';
import { getMatchUpIds } from '../../../global/functions/extractors';
import { extractAttributes as xa } from '../../../utilities/objects';
import { instanceCount, unique } from '../../../utilities/arrays';
import mocksEngine from '../../../assemblies/engines/mock';
import tournamentEngine from '../../engines/syncEngine';
import { expect, test } from 'vitest';

import POLICY_SCHEDULING_NO_DAILY_LIMITS from '../../../fixtures/policies/POLICY_SCHEDULING_NO_DAILY_LIMITS';
import { DOUBLES, SINGLES } from '../../../constants/eventConstants';
import {
  MISSING_EVENT,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

const sst = 'schedule.scheduledTime';
const d210505 = '2021-05-05';

test.each([tournamentEngine])(
  'correctly enumerates participantProfiles for { eventType: DOUBLES }',
  async (tournamentEngine) => {
    const drawProfiles = [{ drawSize: 16, eventType: DOUBLES }];
    const venueProfiles = [{ courtsCount: 3 }];

    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      endDate: '2021-05-07',
      startDate: d210505,
      venueProfiles,
      drawProfiles,
    });

    tournamentEngine.setState([tournamentRecord]);
    const { upcomingMatchUps } = tournamentEngine.getCompetitionMatchUps();
    const { startDate } = tournamentEngine.getCompetitionDateRange();

    const matchUpIds = getMatchUpIds(upcomingMatchUps);
    expect(
      instanceCount(upcomingMatchUps.map(({ matchUpType }) => matchUpType))
    ).toEqual({ DOUBLES: 8 });

    const result = tournamentEngine.scheduleMatchUps({
      scheduleDate: startDate,
      matchUpIds,
    });
    Object.values(result.individualParticipantProfiles).forEach(
      (participantProfile: any) =>
        expect(participantProfile.counters).toEqual({ DOUBLES: 1, total: 1 })
    );
    expect(result.scheduledMatchUpIds.length).toEqual(8);
    expect(result.success).toEqual(true);
  }
);

test.each([tournamentEngine])(
  'auto schedules venue if only one venue provided',
  async (tournamentEngine) => {
    const drawProfiles = [
      {
        eventType: DOUBLES,
        idPrefix: 'dbl',
        eventId: 'e1',
        drawSize: 16,
        drawId: 'd1',
      },
      {
        eventType: SINGLES,
        idPrefix: 'sgl',
        eventId: 'e2',
        drawSize: 64,
        drawId: 'd2',
      },
    ];
    const venueProfiles = [{ courtsCount: 3 }];

    const { tournamentRecord, eventIds } = mocksEngine.generateTournamentRecord(
      {
        policyDefinitions: POLICY_SCHEDULING_NO_DAILY_LIMITS,
        endDate: '2021-05-07',
        startDate: d210505,
        venueProfiles,
        drawProfiles,
      }
    );

    expect(eventIds).toEqual(['e1', 'e2']);

    tournamentEngine.setState([tournamentRecord]);
    const { upcomingMatchUps } = tournamentEngine.getCompetitionMatchUps();
    const { startDate } = tournamentEngine.getCompetitionDateRange();

    const matchUpIds = getMatchUpIds(upcomingMatchUps);
    expect(
      instanceCount(upcomingMatchUps.map(({ matchUpType }) => matchUpType))
    ).toEqual({ DOUBLES: 8, SINGLES: 32 });

    let result = tournamentEngine.scheduleMatchUps({
      scheduleDate: startDate,
      matchUpIds,
    });
    expect(result.success).toEqual(true);
    expect(result.scheduledMatchUpIds.length).toEqual(23);
    expect(
      Object.values(result.individualParticipantProfiles).some(
        (profile: any) =>
          profile.counters.DOUBLES === 1 && profile.counters.SINGLES === 1
      )
    ).toEqual(true);

    const matchUpFilters = { scheduledDate: d210505 };
    result = tournamentEngine.competitionScheduleMatchUps({
      usePublishState: true,
      matchUpFilters,
    });
    expect(result.dateMatchUps.length).toEqual(0);

    result = tournamentEngine.publishOrderOfPlay();
    expect(result.success).toEqual(true);

    result = tournamentEngine.competitionScheduleMatchUps({
      usePublishState: true,
      nextMatchUps: true,
      matchUpFilters,
    });
    expect(result.dateMatchUps.length).toEqual(23);
    expect(result.dateMatchUps[0].winnerTo).toBeDefined();

    result = tournamentEngine.unPublishOrderOfPlay();
    expect(result.success).toEqual(true);

    result = tournamentEngine.competitionScheduleMatchUps({
      usePublishState: true,
      matchUpFilters,
    });
    expect(result.dateMatchUps.length).toEqual(0);

    result = tournamentEngine.publishOrderOfPlay();
    expect(result.success).toEqual(true);

    result = tournamentEngine.competitionScheduleMatchUps({
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

    result = tournamentEngine.reorderUpcomingMatchUps({
      matchUpsContextIds,
      firstToLast: true,
    });
    expect(result.success).toEqual(true);

    result = tournamentEngine.competitionScheduleMatchUps({
      usePublishState: true,
      matchUpFilters,
    });
    expect(result.dateMatchUps.map(xa(sst)).filter(Boolean).length).toEqual(23);

    // there are two events which have matchUps with scheduleTime
    let eventIdWithTime = result.dateMatchUps
      .filter(xa(sst))
      .map(xa('eventId'));
    expect(unique(eventIdWithTime)).toEqual(['e1', 'e2']);

    visualizeScheduledMatchUps({
      scheduledMatchUps: result.dateMatchUps,
      showGlobalLog: false,
    });

    const displaySettings = {
      draws: {
        default: {
          scheduleDetails: [
            {
              attributes: {
                scheduledTime: false,
              },
            },
          ],
        },
      },
    };

    result = tournamentEngine.devContext(true).setEventDisplay();
    expect(result.error).toEqual(MISSING_EVENT);

    result = tournamentEngine.setEventDisplay({ eventId: 'e1' });
    expect(result.error).toEqual(MISSING_VALUE);

    tournamentEngine.setEventDisplay({
      displaySettings,
      eventId: 'e1',
    });

    result = tournamentEngine.competitionScheduleMatchUps({
      usePublishState: true,
      matchUpFilters,
    });
    expect(result.dateMatchUps.map(xa(sst)).filter(Boolean).length).toEqual(15);
    // schedule.scheduledTime has been filtered but not schedule.venueId
    expect(
      result.dateMatchUps.map(xa('schedule.venueId')).filter(Boolean).length
    ).toEqual(23);

    // now there is only one event which have matchUps with scheduleTime
    eventIdWithTime = result.dateMatchUps.filter(xa(sst)).map(xa('eventId'));
    expect(unique(eventIdWithTime)).toEqual(['e2']);

    visualizeScheduledMatchUps({
      scheduledMatchUps: result.dateMatchUps,
      showGlobalLog: false,
    });

    result = tournamentEngine.competitionScheduleMatchUps({
      nextMatchUps: true,
    });
    expect(
      result.dateMatchUps.find((m) => m.winnerMatchUpId && !m.readyToScore)
        ?.potentialParticipants.length
    ).toBeGreaterThan(1);

    const { matchUps } = tournamentEngine.allCompetitionMatchUps({
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

    result = tournamentEngine.reorderUpcomingMatchUps({
      matchUpsContextIds: undefined,
    });
    expect(result.error).not.toBeUndefined();

    result = tournamentEngine.reorderUpcomingMatchUps({
      matchUpsContextIds: [],
    });
    expect(result.success).toEqual(true);

    matchUpFilters.scheduledDate = '2021-05-06';
    result = tournamentEngine.competitionScheduleMatchUps({
      matchUpFilters,
    });
    expect(result.dateMatchUps.length).toEqual(0);

    result = tournamentEngine.scheduleMatchUps({
      scheduleDate: startDate,
      matchUpIds,
    });
    expect(result.scheduledMatchUpIds.length).toEqual(0);
  }
);
