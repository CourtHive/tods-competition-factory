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
  expect(result.valid).toEqual(true);

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

  result = checkRequiredParameters(params, [{ param: 'participantId' }]);
  expect(result.valid).toEqual(true);

  result = checkRequiredParameters(params, [{ param: 'matchUpId' }]);
  expect(result.valid).toEqual(true);

  result = checkRequiredParameters(params, [
    { param: 'participantId' },
    { param: 'matchUpId' },
  ]);
  expect(result.valid).toEqual(true);

  result = checkRequiredParameters(params, [{ param: 'drawId' }]);
  expect(result.error).toEqual(MISSING_DRAW_ID);

  result = checkRequiredParameters({}, [{ param: 'tournamentRecord' }]);
  expect(result.error).toEqual(MISSING_TOURNAMENT_RECORD);

  result = checkRequiredParameters({}, [{ param: 'drawDefinition' }]);
  expect(result.error).toEqual(MISSING_DRAW_DEFINITION);

  result = checkRequiredParameters({}, [{ param: 'participantId' }]);
  expect(result.error).toEqual(MISSING_PARTICIPANT_ID);

  result = checkRequiredParameters({}, [{ param: 'tournamentId' }]);
  expect(result.error).toEqual(MISSING_TOURNAMENT_ID);

  result = checkRequiredParameters({}, [{ param: 'structureId' }]);
  expect(result.error).toEqual(MISSING_STRUCTURE_ID);

  result = checkRequiredParameters({}, [{ param: 'matchUpIds' }]);
  expect(result.error).toEqual(MISSING_MATCHUP_IDS);

  result = checkRequiredParameters({}, [{ param: 'matchUpId' }]);
  expect(result.error).toEqual(MISSING_MATCHUP_ID);

  result = checkRequiredParameters({}, [{ param: 'structures' }]);
  expect(result.error).toEqual(MISSING_STRUCTURES);

  result = checkRequiredParameters({}, [{ param: 'structure' }]);
  expect(result.error).toEqual(MISSING_STRUCTURE);

  result = checkRequiredParameters({}, [{ param: 'unknownParam' }]);
  expect(result.error).toEqual(INVALID_VALUES);

  result = checkRequiredParameters({}, [{ param: 'structureId' }]);
  expect(result.error).toEqual(MISSING_STRUCTURE_ID);

  result = checkRequiredParameters({}, [{ param: 'matchUp' }]);
  expect(result.error).toEqual(MISSING_MATCHUP);

  result = checkRequiredParameters({}, [{ param: 'matchUps' }]);
  expect(result.error).toEqual(MISSING_MATCHUPS);

  result = checkRequiredParameters({}, [{ param: 'eventId' }]);
  expect(result.error).toEqual(MISSING_EVENT);

  result = checkRequiredParameters({}, [{ param: 'event' }]);
  expect(result.error).toEqual(EVENT_NOT_FOUND);
});

it('can check required parameter types', () => {
  let result = checkRequiredParameters({ drawDefinition: 'string' }, [
    { param: 'drawDefinition' },
  ]);
  expect(result.error).toEqual(INVALID_VALUES);
  result = checkRequiredParameters({ drawDefinition: {} }, [
    { param: 'drawDefinition' },
  ]);
  expect(result.valid).toEqual(true);

  result = checkRequiredParameters({ matchUps: {} }, [{ param: 'matchUps' }]);
  expect(result.error).toEqual(INVALID_VALUES);

  // checking can be bypassed
  result = checkRequiredParameters({ matchUps: {}, _bypass: true }, [
    { param: 'matchUps' },
  ]);
  expect(result.valid).toEqual(true);

  result = checkRequiredParameters({ matchUps: [] }, [{ param: 'matchUps' }]);
  expect(result.valid).toEqual(true);
});
