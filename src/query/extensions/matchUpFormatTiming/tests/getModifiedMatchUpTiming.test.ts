import { getModifiedMatchUpFormatTiming } from '../getModifiedMatchUpTiming';
import tournamentEngine from '../../../../examples/syncEngine';
import mocksEngine from '../../../../mocksEngine';
import { expect, it } from 'vitest';

import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
  UNRECOGNIZED_MATCHUP_FORMAT,
} from '../../../../constants/errorConditionConstants';

it('can get modified matchUpTiming', () => {
  // @ts-expect-error no params
  let result = getModifiedMatchUpFormatTiming();
  expect(result.error).toEqual(INVALID_VALUES);

  // @ts-expect-error missing tournament records
  result = getModifiedMatchUpFormatTiming({});
  expect(result.error).toEqual(MISSING_TOURNAMENT_RECORD);

  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32 }],
  });

  // @ts-expect-error missing matchUpFormat
  result = getModifiedMatchUpFormatTiming({ tournamentRecord });
  expect(result.error).toEqual(INVALID_VALUES);

  tournamentEngine.setState(tournamentRecord);
  const { event } = tournamentEngine.getEvent({ eventId });

  // @ts-expect-error missing matchUpFormat
  result = getModifiedMatchUpFormatTiming({
    tournamentRecord,
    event,
  });
  expect(result.error).toEqual(INVALID_VALUES);
  expect(result.info).toEqual({ param: 'matchUpFormat' });

  result = getModifiedMatchUpFormatTiming({
    matchUpFormat: '',
    tournamentRecord,
    event,
  });
  expect(result.error).toEqual(UNRECOGNIZED_MATCHUP_FORMAT);
});
