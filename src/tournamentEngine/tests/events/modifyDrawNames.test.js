import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { INDIVIDUAL } from '../../../constants/participantTypes';

it('can modify flightNames and drawNames', () => {
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

  const newDrawName = 'New Draw Name';
  result = tournamentEngine.modifyDrawName({
    eventId,
    drawId,
    drawName: newDrawName,
  });

  const {
    drawDefinition: { drawName },
  } = tournamentEngine.getEvent({ eventId, drawId });
  expect(drawName).toEqual(newDrawName);

  ({ flightProfile } = tournamentEngine.getFlightProfile({ eventId }));
  expect(flightProfile.flights[0].drawName).toEqual(newDrawName);
});

it('can modify flightNames when no drawDefinitions generated', () => {
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

  const drawId = flightProfile.flights[0].drawId;

  const newDrawName = 'New Draw Name';
  result = tournamentEngine.modifyDrawName({
    eventId,
    drawId,
    drawName: newDrawName,
  });

  ({ flightProfile } = tournamentEngine.getFlightProfile({ eventId }));
  expect(flightProfile.flights[0].drawName).toEqual(newDrawName);
});

it('can modify drawNames when no flightProfile', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();
  const eventName = 'Test Event';
  let event = { eventName };
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

  [0, 1, 2].forEach(() => {
    const { drawDefinition } = tournamentEngine.generateDrawDefinition({
      eventId,
    });
    result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
    expect(result.success).toEqual(true);
  });

  ({ event } = tournamentEngine.getEvent({ eventId }));
  expect(event.drawDefinitions.length).toEqual(3);

  const drawId = event.drawDefinitions[0].drawId;

  const newDrawName = 'New Draw Name';
  result = tournamentEngine.modifyDrawName({
    eventId,
    drawId,
    drawName: newDrawName,
  });
  expect(result.success).toEqual(true);

  const {
    drawDefinition: { drawName },
  } = tournamentEngine.getEvent({ eventId, drawId });
  expect(drawName).toEqual(newDrawName);
});
