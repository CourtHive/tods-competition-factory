import { matchUpActions } from '../governors/queryGovernor/matchUpActions';
import { expect, test } from 'vitest';

import {
  EVENT_NOT_FOUND,
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
} from '../../constants/errorConditionConstants';

test('matchUpActions returns expected error messages', () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let result = matchUpActions();
  expect(result.error).toEqual(INVALID_VALUES);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  result = matchUpActions({
    matchUpId: 'matchUpId',
    eventId: 'eventId',
    drawId: 'drawId',
  });
  expect(result.error).toEqual(INVALID_VALUES);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  result = matchUpActions({
    tournamentId: 'tournamentId',
    matchUpId: 'matchUpId',
    eventId: 'eventId',
    drawId: 'drawId',
    tournamentRecords: {},
  });
  expect(result.error).toEqual(MISSING_TOURNAMENT_RECORD);

  result = matchUpActions({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    tournamentRecords: { tournamentId: {} },
    tournamentId: 'tournamentId',
    matchUpId: 'matchUpId',
    eventId: 'eventId',
    drawId: 'drawId',
  });
  expect(result.error).toEqual(EVENT_NOT_FOUND);
});
