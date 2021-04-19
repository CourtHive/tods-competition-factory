import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import POLICY_SCHEDULING_USTA from '../../../fixtures/policies/POLICY_SCHEDULING_USTA';
import { SINGLES } from '../../../constants/eventConstants';

// categoryTypes
const JUNIOR = 'JUNIOR';

it.each([
  {
    matchUpFormat: 'SET3-S:6/TB7',
    categoryType: JUNIOR,
    averageMinutes: 137,
    recoveryMinutes: 60,
    eventType: SINGLES,
  },
])(
  'can modify matchUpAverageTimes for for matchUpFormats',
  ({
    matchUpFormat,
    categoryName,
    categoryType,
    averageMinutes,
    recoveryMinutes,
    eventType,
  }) => {
    const {
      eventIds: [eventId],
    } = mocksEngine.generateTournamentRecord({
      drawProfiles: [
        {
          drawSize: 32,
        },
      ],
    });

    let result = tournamentEngine.getMatchUpFormatTiming({
      defaultAverageMinutes: 87,
      defaultRecoveryMinutes: 57,
      matchUpFormat,
      categoryName,
      categoryType,
      eventType,
      eventId,
    });
    expect(result.averageMinutes).toEqual(87);
    if (recoveryMinutes) {
      expect(result.recoveryMinutes).toEqual(57);
    }

    result = tournamentEngine.attachPolicy({
      policyDefinition: POLICY_SCHEDULING_USTA,
    });
    expect(result.success).toEqual(true);

    result = tournamentEngine.getMatchUpFormatTiming({
      matchUpFormat,
      categoryName,
      categoryType,
      eventType,
      eventId,
    });
    if (averageMinutes) {
      expect(result.averageMinutes).toEqual(averageMinutes);
    }
    if (recoveryMinutes) {
      expect(result.recoveryMinutes).toEqual(recoveryMinutes);
    }

    result = tournamentEngine.modifyMatchUpFormatTiming({
      matchUpFormat,
      averageTimes: [{ categoryNames: [JUNIOR], minutes: { default: 127 } }],
    });
    expect(result.success).toEqual(true);

    result = tournamentEngine.getMatchUpFormatTiming({
      matchUpFormat,
    });
    expect(result.averageMinutes).toEqual(90);

    result = tournamentEngine.getMatchUpFormatTiming({
      matchUpFormat,
      categoryName: JUNIOR,
    });
    expect(result.averageMinutes).toEqual(127);
  }
);
