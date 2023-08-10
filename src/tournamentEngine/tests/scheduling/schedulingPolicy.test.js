import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import POLICY_SCHEDULING_USTA from '../../../fixtures/policies/POLICY_SCHEDULING_USTA';
import { FORMAT_STANDARD } from '../../../fixtures/scoring/matchUpFormats';
import { DOUBLES, SINGLES } from '../../../constants/eventConstants';

// categoryTypes
const ADULT = 'ADULT';
const JUNIOR = 'JUNIOR';
const WHEELCHAIR = 'WHEELCHAIR';

it.each([
  {
    matchUpFormat: FORMAT_STANDARD,
    categoryType: JUNIOR,
    averageMinutes: 90,
    recoveryMinutes: 60,
    eventType: DOUBLES,
  },
  {
    matchUpFormat: FORMAT_STANDARD,
    categoryType: JUNIOR,
    averageMinutes: 90,
    recoveryMinutes: 60,
    eventType: SINGLES,
  },
  { matchUpFormat: FORMAT_STANDARD, categoryType: ADULT, averageMinutes: 90 },
  {
    matchUpFormat: FORMAT_STANDARD,
    categoryType: WHEELCHAIR,
    averageMinutes: 90,
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
      tournamentRecord,
    } = mocksEngine.generateTournamentRecord({
      drawProfiles: [
        {
          drawSize: 32,
        },
      ],
    });

    let result = tournamentEngine
      .setState(tournamentRecord)
      .getMatchUpFormatTiming({
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

    result = tournamentEngine.attachPolicies({
      policyDefinitions: POLICY_SCHEDULING_USTA,
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
