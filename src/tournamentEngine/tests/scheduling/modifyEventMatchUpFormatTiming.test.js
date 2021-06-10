import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import POLICY_SCHEDULING_USTA from '../../../fixtures/policies/POLICY_SCHEDULING_USTA';
import POLICY_SCORING_USTA from '../../../fixtures/policies/POLICY_SCORING_USTA';
import { SCHEDULE_TIMING } from '../../../constants/extensionConstants';

// categoryTypes
// const JUNIOR = 'JUNIOR';
// const ADULT = 'ADULT';

it('can modify event timing for matchUpFormat codes', () => {
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

  let { eventMatchUpFormatTiming, error } =
    tournamentEngine.getEventMatchUpFormatTiming({
      eventId,
    });

  expect(eventMatchUpFormatTiming).toBeUndefined();
  expect(error).not.toBeUndefined();

  let result = tournamentEngine.modifyEventMatchUpFormatTiming({
    eventId,
    matchUpFormat: 'SET3-S:6/TB7',
    averageMinutes: 127,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.modifyEventMatchUpFormatTiming({
    eventId,
    matchUpFormat: 'SET1-S:4/TB10',
    averageMinutes: 137,
  });
  expect(result.success).toEqual(true);

  // overwriting value of 137 with 117
  result = tournamentEngine.modifyEventMatchUpFormatTiming({
    eventId,
    matchUpFormat: 'SET1-S:4/TB10',
    averageMinutes: 117,
  });
  expect(result.success).toEqual(true);

  ({ eventMatchUpFormatTiming } = tournamentEngine.getEventMatchUpFormatTiming({
    eventId,
  }));
  expect(eventMatchUpFormatTiming.map((t) => t.averageMinutes)).toEqual([
    127, 117,
  ]);
  expect(eventMatchUpFormatTiming.map((t) => t.recoveryMinutes)).toEqual([
    60, 60,
  ]);

  const { extension } = tournamentEngine.findEventExtension({
    eventId,
    name: SCHEDULE_TIMING,
  });
  expect(extension.value.matchUpRecoveryTimes).toEqual([]);

  ({ eventMatchUpFormatTiming } = tournamentEngine.getEventMatchUpFormatTiming({
    eventId,
    matchUpFormats: ['SET3-S:6/TB7', 'SET1-S:4/TB10', 'SET1-S:4/TB10'],
  }));
  // expect duplicated matchUpFormat to be filtered out
  expect(eventMatchUpFormatTiming.map((t) => t.averageMinutes)).toEqual([
    127, 117,
  ]);

  let { methods } = tournamentEngine.getMatchUpFormatTimingUpdate();
  expect(methods.length).toEqual(1);
  expect(methods[0].method).toEqual('addEventExtension');
  expect(methods[0].params.extension.value.matchUpAverageTimes.length).toEqual(
    2
  );

  result = tournamentEngine.removeEventMatchUpFormatTiming({ eventId });
  expect(result.success).toEqual(true);

  ({ methods } = tournamentEngine.getMatchUpFormatTimingUpdate());
  expect(methods.length).toEqual(0);

  ({ eventMatchUpFormatTiming } = tournamentEngine.getEventMatchUpFormatTiming({
    eventId,
    matchUpFormats: ['SET3-S:6/TB7', 'SET1-S:4/TB10'],
  }));
  expect(eventMatchUpFormatTiming.map((t) => t.averageMinutes)).toEqual([
    90, 90,
  ]);

  result = tournamentEngine.getEventMatchUpFormatTiming({
    eventId,
  });
  expect(result.error).not.toBeUndefined();

  const policyDefinition = POLICY_SCORING_USTA;
  tournamentEngine.attachPolicy({ policyDefinition, allowReplacement: true });

  ({ eventMatchUpFormatTiming } = tournamentEngine.getEventMatchUpFormatTiming({
    eventId,
  }));
  expect(policyDefinition.scoring.matchUpFormats.length).toEqual(
    eventMatchUpFormatTiming.length
  );
});
