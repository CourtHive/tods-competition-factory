import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { INDIVIDUAL } from '../../../constants/participantTypes';
import { EXISTING_PROFILE } from '../../../constants/errorConditionConstants';

it('can create and return flighProfiles', () => {
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
  expect(flightProfile.flights.length).toEqual(3);
  expect(flightProfile.flights.map(({ entries }) => entries.length)).toEqual([
    11,
    11,
    10,
  ]);
  expect(flightProfile.flights.map(({ drawName }) => drawName)).toEqual([
    'Flight 1',
    'Flight 2',
    'Flight 3',
  ]);
  expect(flightProfile.flights.every(({ drawId }) => drawId));

  result = tournamentEngine.generateFlightProfile({
    eventId,
    flightsCount: 4,
  });

  expect(result.error).toEqual(EXISTING_PROFILE);

  const { success } = tournamentEngine.generateFlightProfile({
    eventId,
    flightsCount: 4,
    deleteExisting: true,
  });
  expect(success).toEqual(true);

  ({ flightProfile } = tournamentEngine.getFlightProfile({ eventId }));

  expect(flightProfile.flights.length).toEqual(4);
  expect(flightProfile.flights.map(({ entries }) => entries.length)).toEqual([
    8,
    8,
    8,
    8,
  ]);
  expect(flightProfile.flights.map(({ drawName }) => drawName)).toEqual([
    'Flight 1',
    'Flight 2',
    'Flight 3',
    'Flight 4',
  ]);
  expect(flightProfile.flights.every(({ drawId }) => drawId));
});

it.only('can create and return flighProfiles with drawDefinitions', () => {
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

  ({ flightProfile } = tournamentEngine.getFlightProfile({ eventId }));
  expect(
    flightProfile.flights.every(({ drawDefinition }) => drawDefinition)
  ).toEqual(true);
  console.log(flightProfile.flights);
});
