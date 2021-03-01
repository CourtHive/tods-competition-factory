import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { INDIVIDUAL } from '../../../constants/participantTypes';

it('can modify the drawOrder of drawDefniitions within an event', () => {
  mocksEngine.generateTournamentRecord({});
  const eventName = 'Test Event';
  const event = { eventName };
  let result = tournamentEngine.addEvent({ event });
  let { event: eventResult } = result;
  const { eventId } = eventResult;
  expect(result.success).toEqual(true);

  let { flightProfile } = tournamentEngine.getFlightProfile({ eventId });
  expect(flightProfile).toBeUndefined();

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    {
      participantFilters: { participantTypes: [INDIVIDUAL] },
    }
  );
  const participantIds = tournamentParticipants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result.success).toEqual(true);

  ({ flightProfile } = tournamentEngine.generateFlightProfile({
    eventId,
    flightsCount: 3,
  }));

  flightProfile.flights?.forEach((flight) => {
    const { drawDefinition } = tournamentEngine.generateDrawDefinition({
      eventId,
      drawId: flight.drawId,
      drawEntries: flight.drawEntries,
    });
    result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
    expect(result.success).toEqual(true);
  });

  let { event: updatedEvent } = tournamentEngine.getEvent({ eventId });
  const existingOrder = updatedEvent.drawDefinitions.map(
    ({ drawOrder }) => drawOrder
  );
  expect(existingOrder).toEqual([1, 2, 3]);

  const drawIds = updatedEvent.drawDefinitions.map(({ drawId }) => drawId);
  const newOrder = [3, 1, 2];
  const orderedDrawIdsMap = Object.assign(
    {},
    ...drawIds.map((drawId, i) => ({ [drawId]: newOrder[i] }))
  );
  result = tournamentEngine.updateDrawIdsOrder({ eventId, orderedDrawIdsMap });
  expect(result.success).toEqual(true);

  ({ event: updatedEvent } = tournamentEngine.getEvent({ eventId }));
  const drawOrders = updatedEvent.drawDefinitions.map(
    ({ drawOrder }) => drawOrder
  );
  expect(drawOrders).toEqual(newOrder);
});
