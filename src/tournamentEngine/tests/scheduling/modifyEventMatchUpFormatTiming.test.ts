import competitionEngine from '../../../competitionEngine/sync';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import POLICY_SCHEDULING_USTA from '../../../fixtures/policies/POLICY_SCHEDULING_USTA';
import POLICY_SCORING_USTA from '../../../fixtures/policies/POLICY_SCORING_USTA';
import { FORMAT_STANDARD } from '../../../fixtures/scoring/matchUpFormats';
import { SCHEDULE_TIMING } from '../../../constants/extensionConstants';
import {
  EVENT_NOT_FOUND,
  MISSING_EVENT,
} from '../../../constants/errorConditionConstants';

const SHORT4TB10 = 'SET1-S:4/TB10';

it('can modify event timing for matchUpFormat codes', () => {
  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32 }],
  });

  tournamentEngine.setState(tournamentRecord);

  tournamentEngine.attachPolicies({
    policyDefinitions: POLICY_SCHEDULING_USTA,
  });

  const timingResult = tournamentEngine.getEventMatchUpFormatTiming({
    eventId,
  });

  let eventMatchUpFormatTiming = timingResult.eventMatchUpFormatTiming;
  expect(eventMatchUpFormatTiming).toBeUndefined();
  expect(timingResult.error).not.toBeUndefined();

  let result = tournamentEngine.modifyEventMatchUpFormatTiming({
    eventId,
    matchUpFormat: FORMAT_STANDARD,
    averageMinutes: 127,
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
    matchUpFormats: [FORMAT_STANDARD, SHORT4TB10, SHORT4TB10],
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

  result = tournamentEngine.removeEventMatchUpFormatTiming({
    eventId: 'unknownEventId',
  });
  expect(result.error).toEqual(MISSING_EVENT);

  result = competitionEngine.removeEventMatchUpFormatTiming({
    eventId: 'unknownEventId',
  });
  expect(result.error).toEqual(EVENT_NOT_FOUND);

  result = tournamentEngine.removeEventMatchUpFormatTiming({ eventId });
  expect(result.success).toEqual(true);

  ({ methods } = tournamentEngine.getMatchUpFormatTimingUpdate());
  expect(methods.length).toEqual(0);

  ({ eventMatchUpFormatTiming } = tournamentEngine.getEventMatchUpFormatTiming({
    eventId,
    matchUpFormats: [FORMAT_STANDARD, SHORT4TB10],
  }));
  expect(eventMatchUpFormatTiming.map((t) => t.averageMinutes)).toEqual([
    90, 90,
  ]);

  result = tournamentEngine.getEventMatchUpFormatTiming({
    eventId,
  });
  expect(result.error).not.toBeUndefined();

  const policyDefinitions = POLICY_SCORING_USTA;
  tournamentEngine.attachPolicies({
    policyDefinitions,
    allowReplacement: true,
  });
  result = tournamentEngine.getAllowedMatchUpFormats({
    categoryName: undefined,
    categoryType: undefined,
  });
  expect(result.length).toBeGreaterThan(0);

  ({ eventMatchUpFormatTiming } = tournamentEngine.getEventMatchUpFormatTiming({
    eventId,
  }));
  expect(policyDefinitions.scoring.matchUpFormats.length).toEqual(
    eventMatchUpFormatTiming.length
  );
});
