import tournamentEngine from '../..';
import { generateTournament } from '../primitives';

import { SINGLES } from '../../../constants/eventConstants';
import {
  INVALID_TIME_ITEM,
  MISSING_TIME_ITEM,
  NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { RETRIEVAL } from '../../../constants/timeItemConstants';
import { SUCCESS } from '../../../constants/resultConstants';

it('can add and read timeItems from events', () => {
  const { tournamentRecord } = generateTournament({
    startDate: '2021-01-01',
    endDate: '2021-01-06',
    participantsCount: 32,
  });

  tournamentEngine.setState(tournamentRecord);

  const eventName = 'Test Event';
  const event = {
    eventName,
    eventType: SINGLES,
  };

  let result = tournamentEngine.addEvent({ event });
  const { event: eventResult, success } = result;
  const { eventId } = eventResult;
  expect(success).toEqual(true);

  let timeItem = undefined;
  result = tournamentEngine.addEventTimeItem({ eventId, timeItem });
  expect(result.error).toEqual(MISSING_TIME_ITEM);

  timeItem = {
    itemType: RETRIEVAL,
  };
  result = tournamentEngine.addEventTimeItem({ eventId, timeItem });
  expect(result.error).toEqual(INVALID_TIME_ITEM);

  timeItem = {
    itemType: 'RETRIEVAL.RATING',
  };
  result = tournamentEngine.addEventTimeItem({ eventId, timeItem });
  expect(result.error).toEqual(INVALID_TIME_ITEM);

  const itemValue = '2021-01-01T00:00';
  timeItem = {
    itemType: 'RETRIEVAL.RATING.SINGLES.U18',
    itemValue,
  };
  result = tournamentEngine.addEventTimeItem({ eventId, timeItem });
  expect(result).toEqual(SUCCESS);

  let {
    timeItem: retrievedTimeItem,
    message,
  } = tournamentEngine.getEventTimeItem({
    eventId,
    itemType: 'RETRIEVAL.RATING.SINGLES.U18',
  });
  expect(retrievedTimeItem.itemValue).toEqual(itemValue);
  expect(message).toEqual(undefined);

  ({ timeItem: retrievedTimeItem, message } = tournamentEngine.getEventTimeItem(
    {
      eventId,
      itemType: 'RETRIEVAL.RATING.SINGLES.U16',
    }
  ));
  expect(retrievedTimeItem).toEqual(undefined);
  expect(message).toEqual(NOT_FOUND);
});
