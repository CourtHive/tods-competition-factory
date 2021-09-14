import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { INDIVIDUAL } from '../../../constants/participantTypes';
import {
  INVALID_VALUES,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

it('can modify the drawOrder of flightProfile.flights and drawDefniitions within an event', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({});
  const eventName = 'Test Event';
  const event = { eventName };
  let result = tournamentEngine.setState(tournamentRecord).addEvent({ event });
  let { event: eventResult } = result;
  const { eventId } = eventResult;
  expect(result.success).toEqual(true);

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    {
      participantFilters: { participantTypes: [INDIVIDUAL] },
    }
  );
  const participantIds = tournamentParticipants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result.success).toEqual(true);

  let { flightProfile } = tournamentEngine.generateFlightProfile({
    eventId,
    flightsCount: 3,
  });

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
  let orderedDrawIdsMap = Object.assign(
    {},
    ...drawIds.map((drawId, i) => ({ [drawId]: newOrder[i] }))
  );

  result = tournamentEngine.updateDrawIdsOrder({ eventId });
  expect(result.error).toEqual(MISSING_VALUE);

  result = tournamentEngine.updateDrawIdsOrder({
    eventId,
    orderedDrawIdsMap: 'not an object',
  });
  expect(result.error).toEqual(INVALID_VALUES);

  result = tournamentEngine.updateDrawIdsOrder({ eventId, orderedDrawIdsMap });
  expect(result.success).toEqual(true);

  ({ event: updatedEvent } = tournamentEngine.getEvent({ eventId }));
  const drawOrders = updatedEvent.drawDefinitions.map(
    ({ drawOrder }) => drawOrder
  );
  expect(drawOrders).toEqual(newOrder);

  ({ flightProfile } = tournamentEngine.getFlightProfile({ eventId }));
  const flightNumbers = flightProfile.flights.map(
    ({ flightNumber }) => flightNumber
  );
  expect(flightNumbers).toEqual(newOrder);

  orderedDrawIdsMap = Object.assign(
    {},
    ...drawIds.map((drawId) => ({ [drawId]: 'NaN' }))
  );
  result = tournamentEngine.updateDrawIdsOrder({ eventId, orderedDrawIdsMap });
  expect(result.error).toEqual(INVALID_VALUES);

  const notUnique = [0, 0, 1, 1];
  orderedDrawIdsMap = Object.assign(
    {},
    ...drawIds.map((drawId, i) => ({ [drawId]: notUnique[i] }))
  );
  result = tournamentEngine.updateDrawIdsOrder({ eventId, orderedDrawIdsMap });
  expect(result.error).toEqual(INVALID_VALUES);

  orderedDrawIdsMap = Object.assign(
    {},
    ...drawIds.map((drawId, i) => ({ ['bogusId']: newOrder[i] }))
  );
  expect(result.error).toEqual(INVALID_VALUES);
});

it('can modify the drawOrder of flightProfile.flights', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();
  const eventName = 'Test Event';
  const event = { eventName };
  let result = tournamentEngine.setState(tournamentRecord).addEvent({ event });
  let { event: eventResult } = result;
  const { eventId } = eventResult;
  expect(result.success).toEqual(true);

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    {
      participantFilters: { participantTypes: [INDIVIDUAL] },
    }
  );
  const participantIds = tournamentParticipants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result.success).toEqual(true);

  let { flightProfile } = tournamentEngine.generateFlightProfile({
    eventId,
    flightsCount: 3,
  });

  const existingOrder = flightProfile.flights.map(
    ({ flightNumber }) => flightNumber
  );
  expect(existingOrder).toEqual([1, 2, 3]);

  const drawIds = flightProfile.flights.map(({ drawId }) => drawId);
  const newOrder = [3, 1, 2];
  const orderedDrawIdsMap = Object.assign(
    {},
    ...drawIds.map((drawId, i) => ({ [drawId]: newOrder[i] }))
  );
  result = tournamentEngine.updateDrawIdsOrder({ eventId, orderedDrawIdsMap });
  expect(result.success).toEqual(true);

  ({ flightProfile } = tournamentEngine.getFlightProfile({ eventId }));
  const flightNumbers = flightProfile.flights.map(
    ({ flightNumber }) => flightNumber
  );
  expect(flightNumbers).toEqual(newOrder);
});
