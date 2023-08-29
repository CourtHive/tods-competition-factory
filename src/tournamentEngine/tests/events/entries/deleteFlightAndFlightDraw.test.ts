import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../sync';
import { expect, it, test } from 'vitest';

import { INDIVIDUAL } from '../../../../constants/participantConstants';
import {
  MISSING_DRAW_ID,
  MISSING_EVENT,
} from '../../../../constants/errorConditionConstants';

it('can delete flight and flightDrawDefinition', () => {
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

  ({ event: eventResult } = tournamentEngine.getEvent({ eventId }));
  expect(eventResult.entries.length).toEqual(participantIds.length);

  const flightsCount = 2;
  let { flightProfile } = tournamentEngine.generateFlightProfile({
    attachFlightProfile: true,
    flightsCount,
    eventId,
  });
  expect(flightProfile.flights.length).toEqual(flightsCount);
  expect(flightProfile.flights[0].drawEntries.length).toEqual(
    participantIds.length / 2
  );

  flightProfile.flights?.forEach((flight) => {
    const { drawDefinition } = tournamentEngine.generateDrawDefinition({
      drawEntries: flight.drawEntries,
      drawName: flight.drawName,
      drawId: flight.drawId,
      eventId,
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

  result = tournamentEngine.deleteFlightAndFlightDraw({ eventId });
  expect(result.error).toEqual(MISSING_DRAW_ID);
  result = tournamentEngine.deleteFlightAndFlightDraw({ drawId: 'bogusId' });
  expect(result.error).toEqual(MISSING_EVENT);
  result = tournamentEngine.deleteFlightAndFlightDraw({ eventId, drawId });

  ({ event: eventResult } = tournamentEngine.getEvent({ eventId }));
  expect(eventResult.drawDefinitions.length).toEqual(0);
});

test('deleted flights will trigger refresh of drawOrder', () => {
  const mockProfile = {
    eventProfiles: [
      { drawProfiles: [{ drawSize: 4 }, { drawSize: 4 }, { drawSize: 4 }] },
    ],
  };

  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord(mockProfile);

  tournamentEngine.setState(tournamentRecord);

  let { flightProfile } = tournamentEngine.getFlightProfile({ eventId });
  const drawId = flightProfile.flights.find(
    (flight) => flight.flightNumber === 2
  ).drawId;

  const result = tournamentEngine.deleteFlightAndFlightDraw({
    eventId,
    drawId,
  });
  expect(result.success).toEqual(true);

  ({ flightProfile } = tournamentEngine.getFlightProfile({ eventId }));
  const flightNumbers = flightProfile.flights.map(
    ({ flightNumber }) => flightNumber
  );
  expect(flightNumbers).toEqual([1, 2]);
});
