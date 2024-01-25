import mocksEngine from '../../../assemblies/engines/mock';
import tournamentEngine from '../../engines/syncEngine';
import { expect, test } from 'vitest';

import { FORMAT_STANDARD } from '../../../fixtures/scoring/matchUpFormats';
import { EVENT_NOT_FOUND, MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';

// categoryTypes
const JUNIOR = 'JUNIOR';
// const ADULT = 'ADULT';

test.each([tournamentEngine])(
  'it can find matchUpFormat timing across multiple tournament records',
  async (tournamentEngine) => {
    const drawProfiles = [
      {
        drawSize: 8,
      },
    ];
    const {
      tournamentRecord: firstRecord,
      eventIds: [eventId],
    } = mocksEngine.generateTournamentRecord({
      drawProfiles,
      startDate: '2022-01-01',
      endDate: '2022-01-07',
    });
    const { tournamentRecord: secondRecord } = mocksEngine.generateTournamentRecord({
      startDate: '2022-01-02',
      endDate: '2022-01-10',
    });
    tournamentEngine.setState([firstRecord, secondRecord]);

    let { tournamentRecords } = tournamentEngine.getState();
    const tournamentIds = Object.keys(tournamentRecords);

    const matchUpFormat = FORMAT_STANDARD;
    let result = tournamentEngine.findMatchUpFormatTiming({
      categoryType: JUNIOR,
      matchUpFormat,
    });
    expect(result.averageMinutes).toEqual(90);
    expect(result.recoveryMinutes).toEqual(0);

    result = tournamentEngine.modifyMatchUpFormatTiming({
      averageTimes: [{ categoryTypes: [JUNIOR], minutes: { default: 127 } }],
      matchUpFormat: FORMAT_STANDARD,
      tournamentId: 'bogusId',
    });
    expect(result.error).toEqual(MISSING_TOURNAMENT_RECORD);

    result = tournamentEngine.modifyMatchUpFormatTiming({
      averageTimes: [{ categoryTypes: [JUNIOR], minutes: { default: 127 } }],
      matchUpFormat: FORMAT_STANDARD,
      eventId: 'bogusId',
    });
    expect(result.error).toEqual(EVENT_NOT_FOUND);

    result = tournamentEngine.modifyMatchUpFormatTiming({
      averageTimes: [{ categoryTypes: [JUNIOR], minutes: { default: 127 } }],
      matchUpFormat: FORMAT_STANDARD,
    });
    expect(result.success).toEqual(true);

    ({ tournamentRecords } = tournamentEngine.getState());
    expect(tournamentIds.length).toEqual(2);

    tournamentIds.forEach((tournamentId) => {
      const tournamentRecord = tournamentRecords[tournamentId];
      expect(tournamentRecord.extensions[0].value.matchUpAverageTimes.length).toEqual(1);
      tournamentEngine.setTournamentId(tournamentId);
      result = tournamentEngine.getMatchUpFormatTiming({
        matchUpFormat,
        categoryType: JUNIOR,
      });
      expect(result.averageMinutes).toEqual(127);
    });

    result = tournamentEngine.findMatchUpFormatTiming({
      matchUpFormat,
      categoryType: JUNIOR,
    });
    expect(result.averageMinutes).toEqual(127);

    result = tournamentEngine.getMatchUpFormatTimingUpdate();
    expect(result.methods.length).toEqual(1);

    result = tournamentEngine.getEventMatchUpFormatTiming({
      eventId,
      categoryType: JUNIOR,
      matchUpFormats: [matchUpFormat],
    });
    expect(result.eventMatchUpFormatTiming[0].averageMinutes).toEqual(127);
  },
);
