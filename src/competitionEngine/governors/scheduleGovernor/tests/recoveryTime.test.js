import { instanceCount } from '../../../../utilities';
import mocksEngine from '../../../../mocksEngine';
import competitionEngineSync from '../../../sync';
import { ROUND_ROBIN } from '../../../../constants/drawDefinitionConstants';

test.each([competitionEngineSync])(
  'correctly allocates recovery times for Round Robin structures',
  async (competitionEngine) => {
    const drawProfiles = [{ drawSize: 8, drawType: ROUND_ROBIN }];
    const venueProfiles = [{ courtsCount: 2 }];

    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      drawProfiles,
      venueProfiles,
    });

    competitionEngine.setState([tournamentRecord]);
    const { upcomingMatchUps } = competitionEngine.competitionMatchUps();
    const { startDate } = competitionEngine.getCompetitionDateRange();

    const matchUpIds = upcomingMatchUps.map(({ matchUpId }) => matchUpId);
    expect(
      instanceCount(upcomingMatchUps.map(({ matchUpType }) => matchUpType))
    ).toEqual({ SINGLES: 12 });

    let result = competitionEngine.scheduleMatchUps({
      scheduleDate: startDate,
      recoveryMinutes: 30,
      matchUpIds,
    });
    Object.values(result.individualParticipantProfiles).forEach(
      (participantProfile) => {
        expect(participantProfile.counters).toEqual({ SINGLES: 3, total: 3 });
      }
    );
    const afterRecoveryTimes = Object.values(
      result.individualParticipantProfiles
    ).map(({ timeAfterRecovery }) => timeAfterRecovery);

    // prettier-ignore
    expect(afterRecoveryTimes).toEqual([
        '15:00', '14:00', '14:00', '15:00', '19:30', '18:30', '18:30', '19:30',
    ]);

    // prettier-ignore
    expect(Object.values(result.matchUpNotBeforeTimes)).toEqual([
      '09:00', '09:00', '12:30', '12:30', '12:00', '12:00', '16:30', '16:30'
    ]);

    expect(result.scheduledMatchUpIds.length).toEqual(12);
    expect(result.success).toEqual(true);
  }
);

test.each([competitionEngineSync])(
  'respects matchUpDailylimits',
  async (competitionEngine) => {
    const drawProfiles = [{ drawSize: 8, drawType: ROUND_ROBIN }];
    const venueProfiles = [{ courtsCount: 2 }];

    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      drawProfiles,
      venueProfiles,
    });

    competitionEngine.setState([tournamentRecord]);
    const { upcomingMatchUps } = competitionEngine.competitionMatchUps();
    const { startDate } = competitionEngine.getCompetitionDateRange();

    const matchUpIds = upcomingMatchUps.map(({ matchUpId }) => matchUpId);
    expect(
      instanceCount(upcomingMatchUps.map(({ matchUpType }) => matchUpType))
    ).toEqual({ SINGLES: 12 });

    let result = competitionEngine.scheduleMatchUps({
      matchUpDailyLimits: { total: 2 },
      scheduleDate: startDate,
      recoveryMinutes: 30,
      matchUpIds,
    });
    Object.values(result.individualParticipantProfiles).forEach(
      (participantProfile) => {
        expect(participantProfile.counters).toEqual({ SINGLES: 2, total: 2 });
      }
    );
    const afterRecoveryTimes = Object.values(
      result.individualParticipantProfiles
    ).map(({ timeAfterRecovery }) => timeAfterRecovery);

    // prettier-ignore
    expect(afterRecoveryTimes).toEqual([
        '11:00', '12:00', '11:00', '12:00', '15:00', '15:30', '15:00', '15:30'
    ]);

    // prettier-ignore
    expect(Object.values(result.matchUpNotBeforeTimes)).toEqual([
      '09:00', '09:00', '12:30', '12:30', '12:00', '12:00', '15:30', '15:30'
    ]);

    expect(result.scheduledMatchUpIds.length).toEqual(8);
    expect(result.success).toEqual(true);
  }
);
