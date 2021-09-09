import {
  EVENT_NOT_FOUND,
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
} from '../../constants/errorConditionConstants';
import { matchUpActions } from '../governors/queryGovernor/matchUpActions';

test('matchUpActions returns expected error messages', () => {
  let result = matchUpActions();
  expect(result.error).toEqual(INVALID_VALUES);

  result = matchUpActions({
    matchUpId: 'matchUpId',
    eventId: 'eventId',
    drawId: 'drawId',
  });
  expect(result.error).toEqual(INVALID_VALUES);

  result = matchUpActions({
    tournamentId: 'tournamentId',
    matchUpId: 'matchUpId',
    eventId: 'eventId',
    drawId: 'drawId',
    tournamentRecords: {},
  });
  expect(result.error).toEqual(MISSING_TOURNAMENT_RECORD);

  result = matchUpActions({
    tournamentId: 'tournamentId',
    matchUpId: 'matchUpId',
    eventId: 'eventId',
    drawId: 'drawId',
    tournamentRecords: { tournamentId: {} },
  });
  expect(result.error).toEqual(EVENT_NOT_FOUND);
});
