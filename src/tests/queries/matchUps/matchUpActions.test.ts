// import { matchUpActions } from '../../../competitionEngine/governors/queryGovernor/matchUpActions';
import { matchUpActions } from '../../../query/drawDefinition/matchUpActions';
import { expect, test } from 'vitest';

import {
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

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
  expect(result.error).toEqual(MISSING_TOURNAMENT_RECORD);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  result = matchUpActions({
    tournamentId: 'tournamentId',
    tournamentRecords: {},
    matchUpId: 'matchUpId',
    eventId: 'eventId',
    drawId: 'drawId',
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
  expect(result.error).toEqual(MISSING_DRAW_DEFINITION);
});
