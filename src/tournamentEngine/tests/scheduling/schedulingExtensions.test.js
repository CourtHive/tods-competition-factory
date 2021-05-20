import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import POLICY_SCHEDULING_USTA from '../../../fixtures/policies/POLICY_SCHEDULING_USTA';
import { SINGLES } from '../../../constants/eventConstants';
import { SCHEDULE_TIMING } from '../../../constants/extensionConstants';

// categoryTypes
const JUNIOR = 'JUNIOR';
const ADULT = 'ADULT';

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
      averageTimes: [{ categoryTypes: [JUNIOR], minutes: { default: 127 } }],
    });
    expect(result.success).toEqual(true);

    result = tournamentEngine.getMatchUpFormatTiming({
      matchUpFormat,
    });
    expect(result.averageMinutes).toEqual(90);

    result = tournamentEngine.getMatchUpFormatTiming({
      matchUpFormat,
      categoryType: JUNIOR,
    });
    expect(result.averageMinutes).toEqual(127);

    result = tournamentEngine.getModifiedMatchUpFormatTiming({ matchUpFormat });
    expect(result.averageTimes.length).toEqual(1);
  }
);

it('can modify timing for multiple matchUpFormat codes', () => {
  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32 }],
  });

  tournamentEngine.setState(tournamentRecord);

  tournamentEngine.attachPolicy({
    policyDefinition: POLICY_SCHEDULING_USTA,
  });
  tournamentEngine.modifyMatchUpFormatTiming({
    matchUpFormat: 'SET3-S:6/TB7',
    averageTimes: [{ categoryTypes: [JUNIOR], minutes: { default: 127 } }],
  });
  tournamentEngine.modifyMatchUpFormatTiming({
    matchUpFormat: 'SET1-S:4/TB10',
    averageTimes: [{ categoryTypes: [ADULT], minutes: { default: 137 } }],
  });
  let { extension } = tournamentEngine.findTournamentExtension({
    name: SCHEDULE_TIMING,
  });

  expect(extension.value.matchUpAverageTimes.length).toEqual(2);

  tournamentEngine.modifyMatchUpFormatTiming({
    matchUpFormat: 'SET1-S:4/TB10',
    averageTimes: [{ categoryTypes: [ADULT], minutes: { default: 117 } }],
  });

  ({ extension } = tournamentEngine.findTournamentExtension({
    name: SCHEDULE_TIMING,
  }));
  expect(extension.value.matchUpAverageTimes.length).toEqual(2);

  tournamentEngine.modifyMatchUpFormatTiming({
    matchUpFormat: 'SET3-S:4/TB7',
    averageTimes: [{ categoryTypes: [ADULT], minutes: { default: 107 } }],
  });

  ({ extension } = tournamentEngine.findTournamentExtension({
    name: SCHEDULE_TIMING,
  }));
  expect(extension.value.matchUpAverageTimes.length).toEqual(3);

  let { methods } = tournamentEngine.getMatchUpFormatTimingUpdate();
  expect(methods.length).toEqual(1);

  // now make a modification to a specific event
  tournamentEngine.modifyMatchUpFormatTiming({
    eventId,
    matchUpFormat: 'SET1-S:6/TB12',
    averageTimes: [{ categoryTypes: [ADULT], minutes: { default: 107 } }],
  });

  ({ extension } = tournamentEngine.findEventExtension({
    eventId,
    name: SCHEDULE_TIMING,
  }));
  expect(extension.value.matchUpAverageTimes.length).toEqual(1);

  ({ methods } = tournamentEngine.getMatchUpFormatTimingUpdate());
  expect(methods.length).toEqual(2);
});

it('can return matchUpFormatTiming for all matchUpFormats in an event', () => {
  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32 }],
  });

  tournamentEngine.setState(tournamentRecord);

  tournamentEngine.attachPolicy({
    policyDefinition: POLICY_SCHEDULING_USTA,
  });

  let matchUpFormat = 'SET3-S:6/TB7';
  tournamentEngine.modifyMatchUpFormatTiming({
    matchUpFormat,
    averageTimes: [{ categoryTypes: [JUNIOR], minutes: { default: 127 } }],
  });

  let result = tournamentEngine.getMatchUpFormatTiming({
    matchUpFormat,
    categoryType: JUNIOR,
  });
  expect(result.averageMinutes).toEqual(127);

  matchUpFormat = 'SET1-S:4/TB10';
  tournamentEngine.modifyMatchUpFormatTiming({
    matchUpFormat,
    averageTimes: [{ categoryTypes: [ADULT], minutes: { default: 137 } }],
  });

  result = tournamentEngine.getMatchUpFormatTiming({
    matchUpFormat,
    categoryType: ADULT,
  });
  expect(result.averageMinutes).toEqual(137);

  matchUpFormat = 'SET3-S:4/TB7';
  tournamentEngine.modifyMatchUpFormatTiming({
    matchUpFormat,
    averageTimes: [{ categoryTypes: [ADULT], minutes: { default: 107 } }],
  });

  result = tournamentEngine.getMatchUpFormatTiming({
    matchUpFormat,
    categoryType: ADULT,
  });
  expect(result.averageMinutes).toEqual(107);

  // now make a modification to a specific event
  matchUpFormat = 'SET1-S:6/TB12';
  tournamentEngine.modifyMatchUpFormatTiming({
    eventId,
    matchUpFormat,
    averageTimes: [{ categoryTypes: [ADULT], minutes: { default: 107 } }],
  });

  result = tournamentEngine.getMatchUpFormatTiming({
    eventId,
    matchUpFormat,
    categoryType: ADULT,
  });
  expect(result.averageMinutes).toEqual(107);

  let { eventMatchUpFormatTiming } =
    tournamentEngine.getEventMatchUpFormatTiming({
      eventId,
      categoryType: ADULT,
      matchUpFormats: [
        'SET1-S:4/TB10',
        'SET1-S:6/TB12',
        'SET3-S:4/TB7',
        'SET3-S:6/TB7',
      ],
    });
  expect(
    eventMatchUpFormatTiming.map(({ averageMinutes }) => averageMinutes)
  ).toEqual([137, 107, 107, 120]);

  ({ eventMatchUpFormatTiming } = tournamentEngine.getEventMatchUpFormatTiming({
    eventId,
    categoryType: JUNIOR,
    matchUpFormats: [
      'SET1-S:4/TB10',
      'SET1-S:6/TB12',
      'SET3-S:4/TB7',
      'SET3-S:6/TB7',
    ],
  }));
  expect(
    eventMatchUpFormatTiming.map(({ averageMinutes }) => averageMinutes)
  ).toEqual([90, 90, 60, 127]);
});
