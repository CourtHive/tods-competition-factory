import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { COMPASS } from '../../../constants/drawDefinitionConstants';
import { MISSING_EVENT } from '../../../constants/errorConditionConstants';

it('returns eventData', () => {
  const drawProfiles = [{ drawSize: 4, drawType: COMPASS }];
  const {
    eventIds: [eventId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });

  tournamentEngine.setState(tournamentRecord);

  let result = tournamentEngine.getEventData();
  expect(result.error).toEqual(MISSING_EVENT);

  const { eventData } = tournamentEngine.getEventData({ eventId });
  expect(eventData.drawsData[0].structures.length).toEqual(2);
  expect(eventData.drawsData[0].updatedAt).not.toBeUndefined();
});

it('returns eventData', () => {
  const eventProfiles = [{ eventName: 'Test Event' }];
  const {
    eventIds: [eventId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    eventProfiles,
  });
  const { eventData } = tournamentEngine
    .setState(tournamentRecord)
    .getEventData({ eventId });
  expect(eventData.drawsData.length).toEqual(0);

  const { event } = tournamentEngine.getEvent({ eventId });
  expect(event.drawDefinitions).toBeUndefined();
});
