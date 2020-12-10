import tournamentEngine from '../..';
import { tournamentRecordWithParticipants } from '../primitives';

import { SINGLES } from '../../../constants/eventConstants';
import {
  INVALID_TIME_ITEM,
  MISSING_TIME_ITEM,
  NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { RATING, RETRIEVAL } from '../../../constants/timeItemConstants';
import { SUCCESS } from '../../../constants/resultConstants';

it('can add and read timeItems from events', () => {
  const { tournamentRecord, participants } = tournamentRecordWithParticipants({
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
    itemSubject: RETRIEVAL,
  };
  result = tournamentEngine.addEventTimeItem({ eventId, timeItem });
  expect(result.error).toEqual(INVALID_TIME_ITEM);

  timeItem = {
    itemSubject: RETRIEVAL,
    itemType: RATING,
  };
  result = tournamentEngine.addEventTimeItem({ eventId, timeItem });
  expect(result.error).toEqual(INVALID_TIME_ITEM);

  const itemValue = '2021-01-01T00:00';
  timeItem = {
    itemSubject: RETRIEVAL,
    itemType: RATING,
    itemName: 'U18',
    itemValue,
  };
  result = tournamentEngine.addEventTimeItem({ eventId, timeItem });
  expect(result).toEqual(SUCCESS);

  let itemAttributes = {
    itemSubject: RETRIEVAL,
    itemType: RATING,
    itemName: 'U18',
  };
  let {
    timeItem: retrievedTimeItem,
    message,
  } = tournamentEngine.getEventTimeItem({
    eventId,
    itemAttributes,
  });
  expect(retrievedTimeItem.itemValue).toEqual(itemValue);
  expect(message).toEqual(undefined);

  itemAttributes = {
    itemSubject: RETRIEVAL,
    itemType: RATING,
    itemName: 'U16',
  };
  ({ timeItem: retrievedTimeItem, message } = tournamentEngine.getEventTimeItem(
    {
      eventId,
      itemAttributes,
    }
  ));
  expect(retrievedTimeItem).toEqual(undefined);
  expect(message).toEqual(NOT_FOUND);
});
