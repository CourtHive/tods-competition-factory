import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../sync';

import { INDIVIDUAL } from '../../../../constants/participantTypes';

it('will modify flight.drawEntries when no drawDefinition is present', () => {
  const participantsProfile = {
    participantsCount: 40,
  };
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile,
  });

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

  // taking 36 of 40 participants to generate 3 flights of 12
  result = tournamentEngine.addEventEntries({
    eventId,
    participantIds: participantIds.slice(0, 36),
  });
  expect(result.success).toEqual(true);

  let { flightProfile } = tournamentEngine.generateFlightProfile({
    eventId,
    flightsCount: 3,
  });
  expect(flightProfile.flights.length).toEqual(3);
  expect(
    flightProfile.flights.map(({ drawEntries }) => drawEntries.length)
  ).toEqual([12, 12, 12]);
  expect(flightProfile.flights.every(({ drawId }) => drawId));

  const drawIds = flightProfile.flights.map(({ drawId }) => drawId);
  const drawId = drawIds[0];

  const participantIdsToAdd = participantIds.slice(36, 38);
  result = tournamentEngine.addDrawEntries({
    eventId,
    drawId,
    participantIds: participantIdsToAdd,
  });
  expect(result.success).toEqual(true);

  ({ flightProfile } = tournamentEngine.getFlightProfile({ eventId }));
  expect(flightProfile.flights[0].drawEntries.length).toEqual(14);

  const firstFlightParticipantIds = flightProfile.flights[0].drawEntries.map(
    ({ participantId }) => participantId
  );
  const participantIdsToRemove = firstFlightParticipantIds.slice(0, 2);
  result = tournamentEngine.removeDrawEntries({
    eventId,
    drawId,
    participantIds: participantIdsToRemove,
  });
  expect(result.success).toEqual(true);

  ({ flightProfile } = tournamentEngine.getFlightProfile({ eventId }));
  expect(flightProfile.flights[0].drawEntries.length).toEqual(12);
});
