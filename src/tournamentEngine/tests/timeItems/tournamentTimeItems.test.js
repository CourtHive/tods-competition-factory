import tournamentEngine from '../..';
import { tournamentRecordWithParticipants } from '../primitives';

import {
  INVALID_TIME_ITEM,
  MISSING_TIME_ITEM,
  NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { MODIFICATION } from '../../../constants/timeItemConstants';
import { SUCCESS } from '../../../constants/resultConstants';

it('can add and read timeItems from events', () => {
  const { tournamentRecord } = tournamentRecordWithParticipants({
    startDate: '2021-01-01',
    endDate: '2021-01-06',
    participantsCount: 32,
  });

  tournamentEngine.setState(tournamentRecord);

  let timeItem = undefined;
  let result = tournamentEngine.addTournamentTimeItem({ timeItem });
  expect(result.error).toEqual(MISSING_TIME_ITEM);

  timeItem = {
    itemType: MODIFICATION,
  };
  result = tournamentEngine.addTournamentTimeItem({ timeItem });
  expect(result.error).toEqual(INVALID_TIME_ITEM);

  timeItem = {
    itemType: 'MODIFICATION.CONTENT',
  };
  result = tournamentEngine.addTournamentTimeItem({ timeItem });
  expect(result.error).toEqual(INVALID_TIME_ITEM);

  const itemValue = '2021-01-01T00:00';
  timeItem = {
    itemType: 'MODIFICATION.CONTENT',
    itemValue,
  };
  result = tournamentEngine.addTournamentTimeItem({ timeItem });
  expect(result).toEqual(SUCCESS);

  let {
    timeItem: retrievedTimeItem,
    message,
  } = tournamentEngine.getTournamentTimeItem({
    itemType: 'MODIFICATION.CONTENT',
  });
  expect(retrievedTimeItem.itemValue).toEqual(itemValue);
  expect(message).toEqual(undefined);

  ({
    timeItem: retrievedTimeItem,
    message,
  } = tournamentEngine.getTournamentTimeItem({
    itemType: 'MODIFICATION.OTHER',
  }));
  expect(retrievedTimeItem).toEqual(undefined);
  expect(message).toEqual(NOT_FOUND);
});
