import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import { INDIVIDUAL } from '../../../constants/participantConstants';
import {
  DRAW_ID_EXISTS,
  EXISTING_PROFILE,
} from '../../../constants/errorConditionConstants';

it('can create and return flighProfiles', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();
  const eventName = 'Test Event';
  const event = { eventName };
  let result = tournamentEngine.setState(tournamentRecord).addEvent({ event });
  let { event: eventResult } = result;
  const { eventId } = eventResult;
  expect(result.success).toEqual(true);

  let { flightProfile } = tournamentEngine.getFlightProfile({ eventId });
  expect(flightProfile).toBeUndefined();

  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [INDIVIDUAL] },
  });
  const participantIds = tournamentParticipants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result.success).toEqual(true);

  ({ flightProfile } = tournamentEngine.generateFlightProfile({
    attachFlightProfile: true,
    flightsCount: 3,
    eventId,
  }));
  expect(flightProfile.flights.length).toEqual(3);
  expect(
    flightProfile.flights.map(({ drawEntries }) => drawEntries.length)
  ).toEqual([11, 11, 10]);
  expect(flightProfile.flights.map(({ drawName }) => drawName)).toEqual([
    'Flight 1',
    'Flight 2',
    'Flight 3',
  ]);
  expect(flightProfile.flights.every(({ drawId }) => drawId));

  result = tournamentEngine.generateFlightProfile({
    attachFlightProfile: true,
    flightsCount: 4,
    eventId,
  });

  expect(result.error).toEqual(EXISTING_PROFILE);

  result = tournamentEngine.generateFlightProfile({
    attachFlightProfile: true,
    deleteExisting: true,
    flightsCount: 4,
    eventId,
  });
  expect(result.success).toEqual(true);

  ({ flightProfile } = tournamentEngine.getFlightProfile({ eventId }));

  expect(flightProfile.flights.length).toEqual(4);
  expect(
    flightProfile.flights.map(({ drawEntries }) => drawEntries.length)
  ).toEqual([8, 8, 8, 8]);
  expect(flightProfile.flights.map(({ drawName }) => drawName)).toEqual([
    'Flight 1',
    'Flight 2',
    'Flight 3',
    'Flight 4',
  ]);
  expect(flightProfile.flights.every(({ drawId }) => drawId));
  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    convertExtensions: true,
    withStatistics: true,
    withOpponents: true,
    withMatchUps: true,
  }));

  expect(tournamentParticipants[0].events[0].drawIds.length).toBeGreaterThan(0);

  expect(flightProfile.flights.length).toEqual(4);
  const drawIds = flightProfile.flights.map(({ drawId }) => drawId);

  result = tournamentEngine.deleteFlightAndFlightDraw({
    drawId: drawIds[0],
    eventId,
  });
  expect(result.success).toEqual(true);

  ({ flightProfile } = tournamentEngine.getFlightProfile({ eventId }));
  expect(flightProfile.flights.length).toEqual(3);

  result = tournamentEngine.deleteFlightProfileAndFlightDraws({ eventId });
  expect(result.success).toEqual(true);

  ({ flightProfile } = tournamentEngine.getFlightProfile({ eventId }));
  expect(flightProfile).toBeUndefined();
});

it('can create and return flighProfiles with drawDefinitions', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();
  const eventName = 'Test Event';
  const event = { eventName };
  let result = tournamentEngine.setState(tournamentRecord).addEvent({ event });
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
    attachFlightProfile: true,
    flightsCount: 3,
    eventId,
  }));

  flightProfile.flights?.forEach((flight) => {
    const { drawDefinition } = tournamentEngine.generateDrawDefinition({
      drawEntries: flight.drawEntries,
      drawId: flight.drawId,
      eventId,
    });
    result = tournamentEngine.addDrawDefinition({
      drawDefinition,
      eventId,
      flight,
    });
    expect(result.success).toEqual(true);
    result = tournamentEngine.addDrawDefinition({
      drawDefinition,
      eventId,
      flight,
    });
    expect(result.error).toEqual(DRAW_ID_EXISTS);
  });

  ({ flightProfile } = tournamentEngine.getFlightProfile({ eventId }));
  expect(
    flightProfile.flights.every(({ drawDefinition }) => drawDefinition)
  ).toEqual(true);
});
