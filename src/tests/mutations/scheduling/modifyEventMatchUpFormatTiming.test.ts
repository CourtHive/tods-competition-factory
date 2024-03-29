import { removeEventMatchUpFormatTiming } from '@Mutate/extensions/events/removeEventMatchUpFormatTiming';
import mocksEngine from '@Assemblies/engines/mock';
import tournamentEngine from '@Engines/syncEngine';
import { expect, it } from 'vitest';

// constants and fixtures
import POLICY_SCHEDULING_DEFAULT from '@Fixtures/policies/POLICY_SCHEDULING_DEFAULT';
import POLICY_SCORING_USTA from '@Fixtures/policies/POLICY_SCORING_USTA';
import { EVENT_NOT_FOUND } from '@Constants/errorConditionConstants';
import { FORMAT_STANDARD } from '@Fixtures/scoring/matchUpFormats';
import { SCHEDULE_TIMING } from '@Constants/extensionConstants';

const SHORT4TB10 = 'SET1-S:4/TB10';

it('can modify event timing for matchUpFormat codes', () => {
  const {
    tournamentRecord,
    eventIds: [eventId, eventId2],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32 }, { drawSize: 16 }],
  });

  let result = tournamentEngine.removeEventMatchUpFormatTiming({
    tournamentRecord,
    eventId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.removeEventMatchUpFormatTiming({
    tournamentRecord,
  });
  expect(result.error).toEqual(EVENT_NOT_FOUND);

  result = tournamentEngine.removeEventMatchUpFormatTiming({
    tournamentRecord,
    eventId: 'bogusEventId',
  });
  expect(result.error).toEqual(EVENT_NOT_FOUND);

  // @ts-expect-error missing eventId
  result = removeEventMatchUpFormatTiming({ tournamentRecord });
  expect(result.error).toEqual(EVENT_NOT_FOUND);

  result = removeEventMatchUpFormatTiming({
    eventId: eventId2,
    tournamentRecord,
  });
  expect(result.success).toEqual(true);

  result = removeEventMatchUpFormatTiming({
    eventId: 'bogusEventId',
    tournamentRecord,
  });
  expect(result.error).toEqual(EVENT_NOT_FOUND);

  tournamentEngine.setState(tournamentRecord);

  tournamentEngine.attachPolicies({
    policyDefinitions: POLICY_SCHEDULING_DEFAULT,
  });

  const timingResult = tournamentEngine.getEventMatchUpFormatTiming({
    eventId,
  });

  let eventMatchUpFormatTiming = timingResult.eventMatchUpFormatTiming;
  expect(eventMatchUpFormatTiming).not.toBeUndefined();

  result = tournamentEngine.modifyEventMatchUpFormatTiming({
    matchUpFormat: FORMAT_STANDARD,
    averageMinutes: 127,
    eventId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.modifyEventMatchUpFormatTiming({
    eventId,
    matchUpFormat: SHORT4TB10,
    averageMinutes: 137,
  });
  expect(result.success).toEqual(true);

  // overwriting value of 137 with 117
  result = tournamentEngine.modifyEventMatchUpFormatTiming({
    eventId,
    matchUpFormat: SHORT4TB10,
    averageMinutes: 117,
  });
  expect(result.success).toEqual(true);

  ({ eventMatchUpFormatTiming } = tournamentEngine.getEventMatchUpFormatTiming({
    eventId,
  }));
  expect(eventMatchUpFormatTiming.map((t) => t.averageMinutes)).toEqual([127, 117]);
  expect(eventMatchUpFormatTiming.map((t) => t.recoveryMinutes)).toEqual([60, 60]);

  const { extension } = tournamentEngine.findExtension({
    name: SCHEDULE_TIMING,
    discover: ['event'],
    eventId,
  });
  expect(extension.value.matchUpRecoveryTimes).toEqual([]);

  ({ eventMatchUpFormatTiming } = tournamentEngine.getEventMatchUpFormatTiming({
    eventId,
    matchUpFormats: [FORMAT_STANDARD, SHORT4TB10, SHORT4TB10],
  }));
  // expect duplicated matchUpFormat to be filtered out
  expect(eventMatchUpFormatTiming.map((t) => t.averageMinutes)).toEqual([127, 117]);

  let { methods } = tournamentEngine.getMatchUpFormatTimingUpdate();
  expect(methods.length).toEqual(1);
  expect(methods[0].method).toEqual('addEventExtension');
  expect(methods[0].params.extension.value.matchUpAverageTimes.length).toEqual(2);

  result = tournamentEngine.removeEventMatchUpFormatTiming({});
  expect(result.error).toEqual(EVENT_NOT_FOUND);

  result = tournamentEngine.removeEventMatchUpFormatTiming({
    eventId: 'unknownEventId',
  });
  expect(result.error).toEqual(EVENT_NOT_FOUND);

  result = tournamentEngine.removeEventMatchUpFormatTiming({
    eventId: 'unknownEventId',
  });
  expect(result.error).toEqual(EVENT_NOT_FOUND);

  result = tournamentEngine.removeEventMatchUpFormatTiming({ eventId });
  expect(result.success).toEqual(true);

  ({ methods } = tournamentEngine.getMatchUpFormatTimingUpdate());
  expect(methods.length).toEqual(0);

  ({ eventMatchUpFormatTiming } = tournamentEngine.getEventMatchUpFormatTiming({
    matchUpFormats: [FORMAT_STANDARD, SHORT4TB10],
    eventId,
  }));
  expect(eventMatchUpFormatTiming.map((t) => t.averageMinutes)).toEqual([90, 90]);

  result = tournamentEngine.getEventMatchUpFormatTiming({
    eventId,
  });
  expect(result.error).toBeUndefined();

  const policyDefinitions = POLICY_SCORING_USTA;
  tournamentEngine.attachPolicies({
    allowReplacement: true,
    policyDefinitions,
  });
  result = tournamentEngine.getAllowedMatchUpFormats({
    categoryName: undefined,
    categoryType: undefined,
  });
  expect(result.length).toBeGreaterThan(0);

  ({ eventMatchUpFormatTiming } = tournamentEngine.getEventMatchUpFormatTiming({
    eventId,
  }));
  expect(policyDefinitions.scoring.matchUpFormats.length).toEqual(eventMatchUpFormatTiming.length);
});
