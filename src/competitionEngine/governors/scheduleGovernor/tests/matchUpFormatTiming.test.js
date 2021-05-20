import competitionEngineSync from '../../../sync';
import mocksEngine from '../../../../mocksEngine';

// categoryTypes
const JUNIOR = 'JUNIOR';
// const ADULT = 'ADULT';

test.each([competitionEngineSync])(
  'it can find matchUpFormat timing across multiple tournament records',
  async (competitionEngine) => {
    const { tournamentRecord: firstRecord } =
      mocksEngine.generateTournamentRecord({
        startDate: '2022-01-01',
        endDate: '2022-01-07',
      });
    const { tournamentRecord: secondRecord } =
      mocksEngine.generateTournamentRecord({
        startDate: '2022-01-02',
        endDate: '2022-01-10',
      });
    competitionEngine.setState([firstRecord, secondRecord]);

    const matchUpFormat = 'SET3-S:6/TB7';
    let result = competitionEngine.findMatchUpFormatTiming({
      matchUpFormat,
      categoryType: JUNIOR,
    });
    expect(result.averageMinutes).toBeUndefined();
    expect(result.recoveryMinutes).toBeUndefined();

    result = competitionEngine.modifyMatchUpFormatTiming({
      matchUpFormat: 'SET3-S:6/TB7',
      averageTimes: [{ categoryTypes: [JUNIOR], minutes: { default: 127 } }],
    });
    expect(result.success).toEqual(true);

    const { tournamentRecords } = competitionEngine.getState();
    const tournamentIds = Object.keys(tournamentRecords);
    expect(tournamentIds.length).toEqual(2);
    tournamentIds.forEach((tournamentId) => {
      expect(
        tournamentRecords[tournamentId].extensions[0].value.matchUpAverageTimes
          .length
      ).toEqual(1);
    });

    competitionEngine.findMatchUpFormatTiming({
      matchUpFormat,
      categoryType: JUNIOR,
    });
  }
);
