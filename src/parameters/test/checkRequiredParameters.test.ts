/**
 * Tests for the `checkRequiredParameters` method.
 * Verifies that the function correctly checks for required parameters and returns the expected results.
 */
import { checkRequiredParameters } from '../checkRequiredParameters';
import { expect, it } from 'vitest';

import {
  EVENT_NOT_FOUND,
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  MISSING_DRAW_ID,
  MISSING_EVENT,
  MISSING_MATCHUP,
  MISSING_MATCHUPS,
  MISSING_MATCHUP_ID,
  MISSING_MATCHUP_IDS,
  MISSING_PARTICIPANT_ID,
  MISSING_STRUCTURE,
  MISSING_STRUCTURES,
  MISSING_STRUCTURE_ID,
  MISSING_TOURNAMENT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../constants/errorConditionConstants';

it('can check required parameters', () => {
  // @ts-expect-error missing param
  let result = checkRequiredParameters();
  expect(result.error).toEqual(INVALID_VALUES);

  // @ts-expect-error missing param
  result = checkRequiredParameters({});
  expect(result.valid).toEqual(true);

  const params = {
    participantId: 'participantId',
    matchUpId: 'matchUpId',
  };
  // @ts-expect-error missing param
  result = checkRequiredParameters(params);
  expect(result.valid).toEqual(true);

  result = checkRequiredParameters(params, [{ participantId: true }]);
  expect(result.valid).toEqual(true);

  result = checkRequiredParameters(params, [{ matchUpId: true }]);
  expect(result.valid).toEqual(true);

  result = checkRequiredParameters(params, [
    { participantId: true },
    { matchUpId: true },
  ]);
  expect(result.valid).toEqual(true);

  result = checkRequiredParameters(params, [
    { participantId: true, matchUpId: true },
  ]);
  expect(result.valid).toEqual(true);

  result = checkRequiredParameters(params, [{ drawId: true }]);
  expect(result.error).toEqual(MISSING_DRAW_ID);

  result = checkRequiredParameters(params, [
    { participantId: true, matchUpId: true, drawId: true },
  ]);
  expect(result.error).toEqual(MISSING_DRAW_ID);

  result = checkRequiredParameters({}, [{ tournamentRecord: true }]);
  expect(result.error).toEqual(MISSING_TOURNAMENT_RECORD);

  result = checkRequiredParameters({}, [{ drawDefinition: true }]);
  expect(result.error).toEqual(MISSING_DRAW_DEFINITION);

  result = checkRequiredParameters({}, [{ participantId: true }]);
  expect(result.error).toEqual(MISSING_PARTICIPANT_ID);

  result = checkRequiredParameters({}, [{ tournamentId: true }]);
  expect(result.error).toEqual(MISSING_TOURNAMENT_ID);

  result = checkRequiredParameters({}, [{ structureId: true }]);
  expect(result.error).toEqual(MISSING_STRUCTURE_ID);

  result = checkRequiredParameters({}, [{ matchUpIds: true }]);
  expect(result.error).toEqual(MISSING_MATCHUP_IDS);

  result = checkRequiredParameters({}, [{ matchUpId: true }]);
  expect(result.error).toEqual(MISSING_MATCHUP_ID);

  result = checkRequiredParameters({}, [{ structures: true }]);
  expect(result.error).toEqual(MISSING_STRUCTURES);

  result = checkRequiredParameters({}, [{ structure: true }]);
  expect(result.error).toEqual(MISSING_STRUCTURE);

  result = checkRequiredParameters({}, [{ unknownParam: true }]);
  expect(result.error).toEqual(INVALID_VALUES);

  result = checkRequiredParameters({}, [{ structureId: true }]);
  expect(result.error).toEqual(MISSING_STRUCTURE_ID);

  result = checkRequiredParameters({}, [{ matchUp: true }]);
  expect(result.error).toEqual(MISSING_MATCHUP);

  result = checkRequiredParameters({}, [{ matchUps: true }]);
  expect(result.error).toEqual(MISSING_MATCHUPS);

  result = checkRequiredParameters({}, [{ eventId: true }]);
  expect(result.error).toEqual(MISSING_EVENT);

  result = checkRequiredParameters({}, [{ event: true }]);
  expect(result.error).toEqual(EVENT_NOT_FOUND);
});

it('can check required parameter types', () => {
  let result = checkRequiredParameters({ drawDefinition: 'string' }, [
    { drawDefinition: true },
  ]);
  expect(result.error).toEqual(INVALID_VALUES);

  result = checkRequiredParameters({ drawDefinition: {} }, [
    { drawDefinition: true },
  ]);
  expect(result.valid).toEqual(true);

  result = checkRequiredParameters({ matchUps: {} }, [{ matchUps: true }]);
  expect(result.error).toEqual(INVALID_VALUES);

  // checking can be bypassed
  result = checkRequiredParameters({ matchUps: {}, _bypassParamCheck: true }, [
    { matchUps: true },
  ]);
  expect(result.valid).toEqual(true);

  result = checkRequiredParameters({ matchUps: [] }, [{ matchUps: true }]);
  expect(result.valid).toEqual(true);
});
