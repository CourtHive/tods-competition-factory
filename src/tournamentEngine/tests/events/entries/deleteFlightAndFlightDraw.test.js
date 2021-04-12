import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../sync';

import { INDIVIDUAL } from '../../../../constants/participantTypes';

it('can delete flight and flightDrawDefinition', () => {
  mocksEngine.generateTournamentRecord({});
  const eventName = 'Test Event';
  const event = { eventName };
  let result = tournamentEngine.addEvent({ event });
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

  ({ event: eventResult } = tournamentEngine.getEvent({ eventId }));
  expect(eventResult.entries.length).toEqual(participantIds.length);

  const flightsCount = 2;
  let { flightProfile } = tournamentEngine.generateFlightProfile({
    eventId,
    flightsCount,
  });
  expect(flightProfile.flights.length).toEqual(flightsCount);
  expect(flightProfile.flights[0].drawEntries.length).toEqual(
    participantIds.length / 2
  );

  flightProfile.flights?.forEach((flight) => {
    const { drawDefinition } = tournamentEngine.generateDrawDefinition({
      eventId,
      drawId: flight.drawId,
      drawName: flight.drawName,
      drawEntries: flight.drawEntries,
    });
    result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
    expect(result.success).toEqual(true);
  });

  const drawId = flightProfile.flights[0].drawId;

  result = tournamentEngine.deleteFlightAndFlightDraw({ eventId, drawId });
  expect(result.success).toEqual(true);
  ({ flightProfile } = tournamentEngine.getFlightProfile({ eventId }));
  expect(flightProfile.flights.length).toEqual(flightsCount - 1);
});

it('can delete drawDefinition when there is no flight', () => {
  mocksEngine.generateTournamentRecord({});
  const eventName = 'Test Event';
  const event = { eventName };
  let result = tournamentEngine.addEvent({ event });
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

  ({ event: eventResult } = tournamentEngine.getEvent({ eventId }));
  expect(eventResult.entries.length).toEqual(participantIds.length);

  const { drawDefinition } = tournamentEngine.generateDrawDefinition({
    eventId,
  });
  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result.success).toEqual(true);
  ({ event: eventResult } = tournamentEngine.getEvent({ eventId }));
  expect(eventResult.drawDefinitions.length).toEqual(1);

  const { drawId } = drawDefinition;

  result = tournamentEngine.deleteFlightAndFlightDraw({ eventId, drawId });

  ({ event: eventResult } = tournamentEngine.getEvent({ eventId }));
  expect(eventResult.drawDefinitions.length).toEqual(0);
});
