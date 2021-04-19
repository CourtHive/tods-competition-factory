import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { DOUBLES, SINGLES } from '../../../constants/eventConstants';
import POLICY_SCHEDULING_USTA from '../../../fixtures/policies/POLICY_SCHEDULING_USTA';

// categoryTypes
const ADULT = 'ADULT';
const JUNIOR = 'JUNIOR';
const WHEELCHAIR = 'WHEELCHAIR';

it.each([
  { matchUpFormat: 'SET1-S:4/TB5@3', averageMinutes: 20, recoveryMinutes: 15 },
  {
    matchUpFormat: 'SET3-S:6/TB7',
    categoryType: JUNIOR,
    averageMinutes: 137,
    recoveryMinutes: 30,
    eventType: DOUBLES,
  },
  {
    matchUpFormat: 'SET3-S:6/TB7',
    categoryType: JUNIOR,
    averageMinutes: 137,
    recoveryMinutes: 60,
    eventType: SINGLES,
  },
  { matchUpFormat: 'SET3-S:6/TB7', categoryType: ADULT, averageMinutes: 120 },
  {
    matchUpFormat: 'SET3-S:6/TB7',
    categoryType: WHEELCHAIR,
    averageMinutes: 120,
  },
])(
  'can retrieve matchUpAverageTimes for for matchUpFormats',
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
  }
);
