import tournamentEngine from '../../sync';
import { generateTournamentWithParticipants } from '../../../mocksEngine/generators/generateTournamentWithParticipants';

import { SINGLES } from '../../../constants/eventConstants';
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
  const { participants } = tournamentRecord;

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

  const participantIds = participants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result).toEqual(SUCCESS);

  const values = {
    automated: true,
    drawSize: 32,
    eventId,
    participants,
    event: eventResult,
  };
  const { drawDefinition } = tournamentEngine.generateDrawDefinition(values);
  const { drawId } = drawDefinition;

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result).toEqual(SUCCESS);

  let timeItem = undefined;
  result = tournamentEngine.addDrawDefinitionTimeItem({ drawId, timeItem });
  expect(result.error).toEqual(MISSING_TIME_ITEM);

  timeItem = {
    itemType: MODIFICATION,
  };
  result = tournamentEngine.addDrawDefinitionTimeItem({ drawId, timeItem });
  expect(result.error).toEqual(INVALID_TIME_ITEM);

  timeItem = {
    itemType: 'MODIFICATION.CONTENT',
  };
  result = tournamentEngine.addDrawDefinitionTimeItem({ drawId, timeItem });
  expect(result.error).toEqual(INVALID_TIME_ITEM);

  const itemValue = '2021-01-01T00:00';
  timeItem = {
    itemType: 'MODIFICATION.CONTENT',
    itemValue,
  };
  result = tournamentEngine.addDrawDefinitionTimeItem({ drawId, timeItem });
  expect(result).toEqual(SUCCESS);

  let { timeItem: retrievedTimeItem, message } =
    tournamentEngine.getDrawDefinitionTimeItem({
      drawId,
      itemType: 'MODIFICATION.CONTENT',
    });
  expect(retrievedTimeItem.itemValue).toEqual(itemValue);
  expect(message).toEqual(undefined);

  ({ timeItem: retrievedTimeItem, message } =
    tournamentEngine.getDrawDefinitionTimeItem({
      drawId,
      itemType: 'MODIFICATION.OTHER',
    }));
  expect(retrievedTimeItem).toEqual(undefined);
  expect(message).toEqual(NOT_FOUND);

  const {
    event: {
      drawDefinitions: [updatedDrawDefinition],
    },
  } = tournamentEngine.getEvent({ eventId });
  expect(updatedDrawDefinition.timeItems.length).toEqual(1);
});
