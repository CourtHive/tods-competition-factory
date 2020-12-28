import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../..';

import {
  INVALID_TIME_ITEM,
  MISSING_TIME_ITEM,
  NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { RETRIEVAL } from '../../../constants/timeItemConstants';
import { SUCCESS } from '../../../constants/resultConstants';

it('can add and read timeItems from participants', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();

  tournamentEngine.setState(tournamentRecord);

  const {
    tournamentParticipants,
  } = tournamentEngine.getTournamentParticipants();

  const { participantId } = tournamentParticipants[0];

  let timeItem = undefined;
  let result = tournamentEngine.addParticipantTimeItem({
    participantId,
    timeItem,
  });
  expect(result.error).toEqual(MISSING_TIME_ITEM);

  timeItem = {
    itemType: RETRIEVAL,
  };
  result = tournamentEngine.addParticipantTimeItem({ participantId, timeItem });
  expect(result.error).toEqual(INVALID_TIME_ITEM);

  timeItem = {
    itemType: 'BOGUS.TIME.ITEM',
  };
  result = tournamentEngine.addParticipantTimeItem({ participantId, timeItem });
  expect(result.error).toEqual(INVALID_TIME_ITEM);

  const itemValue = '2021-01-01T00:00';
  timeItem = {
    itemType: 'TESTING.1',
    itemValue,
  };
  result = tournamentEngine.addParticipantTimeItem({ participantId, timeItem });
  expect(result).toEqual(SUCCESS);

  let {
    timeItem: retrievedTimeItem,
    message,
  } = tournamentEngine.getParticipantTimeItem({
    participantId,
    itemType: 'TESTING.1',
  });
  expect(retrievedTimeItem.itemValue).toEqual(itemValue);
  expect(message).toEqual(undefined);

  ({
    timeItem: retrievedTimeItem,
    message,
  } = tournamentEngine.getParticipantTimeItem({
    participantId,
    itemType: 'TESTING.2',
  }));
  expect(retrievedTimeItem).toEqual(undefined);
  expect(message).toEqual(NOT_FOUND);
});
