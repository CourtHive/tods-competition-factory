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
    itemSubject: MODIFICATION,
  };
  result = tournamentEngine.addTournamentTimeItem({ timeItem });
  expect(result.error).toEqual(INVALID_TIME_ITEM);

  timeItem = {
    itemSubject: MODIFICATION,
    itemType: 'CONTENT',
  };
  result = tournamentEngine.addTournamentTimeItem({ timeItem });
  expect(result.error).toEqual(INVALID_TIME_ITEM);

  const itemValue = '2021-01-01T00:00';
  timeItem = {
    itemSubject: MODIFICATION,
    itemType: 'CONTENT',
    itemValue,
  };
  result = tournamentEngine.addTournamentTimeItem({ timeItem });
  expect(result).toEqual(SUCCESS);

  let itemAttributes = {
    itemSubject: MODIFICATION,
    itemType: 'CONTENT',
  };
  let {
    timeItem: retrievedTimeItem,
    message,
  } = tournamentEngine.getTournamentTimeItem({
    itemAttributes,
  });
  expect(retrievedTimeItem.itemValue).toEqual(itemValue);
  expect(message).toEqual(undefined);

  itemAttributes = {
    itemSubject: MODIFICATION,
    itemType: 'OTHER',
  };
  ({
    timeItem: retrievedTimeItem,
    message,
  } = tournamentEngine.getTournamentTimeItem({
    itemAttributes,
  }));
  expect(retrievedTimeItem).toEqual(undefined);
  expect(message).toEqual(NOT_FOUND);
});
