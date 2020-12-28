import tournamentEngine from '../..';
import { generateTournamentWithParticipants } from '../../../mocksEngine/generators/generateTournamentWithParticipants';

import {
  INVALID_TIME_ITEM,
  MISSING_TIME_ITEM,
  NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { MODIFICATION } from '../../../constants/timeItemConstants';
import { SUCCESS } from '../../../constants/resultConstants';

it('can add and read timeItems from events', () => {
  const { tournamentRecord } = generateTournamentWithParticipants({
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

  let itemValue = '2021-01-01T00:00';
  timeItem = {
    itemType: 'MODIFICATION.CONTENT',
    itemValue,
  };
  result = tournamentEngine.addTournamentTimeItem({ timeItem });
  expect(result).toEqual(SUCCESS);

  timeItem = {
    itemType: 'MODIFICATION.CONTENT',
    itemValue,
  };
  result = tournamentEngine.addTournamentTimeItem({
    timeItem,
  });
  expect(result).toEqual(SUCCESS);

  itemValue = '2021-01-02T00:00';
  timeItem = {
    itemType: 'MODIFICATION.CONTENT',
    itemValue,
  };
  result = tournamentEngine.addTournamentTimeItem({ timeItem });
  expect(result).toEqual(SUCCESS);

  let {
    timeItem: retrievedTimeItem,
    previousItems,
    message,
  } = tournamentEngine.getTournamentTimeItem({
    itemType: 'MODIFICATION.CONTENT',
    returnPreviousValues: true,
  });
  expect(retrievedTimeItem.itemValue).toEqual(itemValue);
  expect(previousItems.length).toEqual(2);
  expect(message).toEqual(undefined);

  ({
    timeItem: retrievedTimeItem,
    message,
    previousItems,
  } = tournamentEngine.getTournamentTimeItem({
    itemType: 'MODIFICATION.OTHER',
  }));
  expect(retrievedTimeItem).toEqual(undefined);
  expect(message).toEqual(NOT_FOUND);
});

it('can prevent duplicates when equialent to existing itemValue', () => {
  const { tournamentRecord } = generateTournamentWithParticipants({
    startDate: '2021-01-01',
    endDate: '2021-01-06',
    participantsCount: 32,
  });

  tournamentEngine.setState(tournamentRecord);

  let timeItem = undefined;
  let itemValue = '2021-01-01T00:00';
  timeItem = {
    itemType: 'MODIFICATION.CONTENT',
    itemValue,
  };
  let result = tournamentEngine.addTournamentTimeItem({ timeItem });
  expect(result).toEqual(SUCCESS);

  timeItem = {
    itemType: 'MODIFICATION.CONTENT',
    itemValue,
  };
  result = tournamentEngine.addTournamentTimeItem({
    timeItem,
    duplicateValues: false,
  });
  expect(result).toEqual(SUCCESS);

  itemValue = '2021-01-02T00:00';
  timeItem = {
    itemType: 'MODIFICATION.CONTENT',
    itemValue,
  };
  result = tournamentEngine.addTournamentTimeItem({ timeItem });
  expect(result).toEqual(SUCCESS);

  let {
    timeItem: retrievedTimeItem,
    previousItems,
    message,
  } = tournamentEngine.getTournamentTimeItem({
    itemType: 'MODIFICATION.CONTENT',
    returnPreviousValues: true,
  });
  expect(retrievedTimeItem.itemValue).toEqual(itemValue);
  expect(previousItems.length).toEqual(1);
  expect(message).toEqual(undefined);

  // now test where the duplicate values are not sequential
  // should add the duplicate value because it is not the "current" value at the time of addition
  itemValue = '2021-01-01T00:00';
  timeItem = {
    itemType: 'MODIFICATION.OTHER',
    itemValue,
  };
  result = tournamentEngine.addTournamentTimeItem({ timeItem });
  expect(result).toEqual(SUCCESS);

  itemValue = '2021-01-02T00:00';
  timeItem = {
    itemType: 'MODIFICATION.OTHER',
    itemValue,
  };
  result = tournamentEngine.addTournamentTimeItem({
    timeItem,
    duplicateValues: false,
  });
  expect(result).toEqual(SUCCESS);

  itemValue = '2021-01-01T00:00';
  timeItem = {
    itemType: 'MODIFICATION.OTHER',
    itemValue,
  };
  result = tournamentEngine.addTournamentTimeItem({ timeItem });
  expect(result).toEqual(SUCCESS);

  ({
    timeItem: retrievedTimeItem,
    previousItems,
    message,
  } = tournamentEngine.getTournamentTimeItem({
    itemType: 'MODIFICATION.OTHER',
    returnPreviousValues: true,
  }));
  expect(retrievedTimeItem.itemValue).toEqual(itemValue);
  expect(previousItems.length).toEqual(2);
  expect(message).toEqual(undefined);

  // expect the retrieved itemValue to equal the initial itemValue
  expect(retrievedTimeItem.itemValue).toEqual(previousItems[0].itemValue);
  // expect the retrieved itemValue NOT to equal the latest itemValue
  expect(retrievedTimeItem.itemValue).not.toEqual(previousItems[1].itemValue);
});
