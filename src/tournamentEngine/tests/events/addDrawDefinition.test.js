import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { INDIVIDUAL } from '../../../constants/participantTypes';

it('can create flightProfile on addDrawDefinition', () => {
  mocksEngine.generateTournamentRecord({});
  const eventName = 'Test Event';
  const event = { eventName };
  let result = tournamentEngine.addEvent({ event });
  let { event: eventResult } = result;
  expect(result.success).toEqual(true);

  const { eventId } = eventResult;

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    {
      participantFilters: { participantTypes: [INDIVIDUAL] },
    }
  );
  const participantIds = tournamentParticipants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result.success).toEqual(true);

  const { drawDefinition } = tournamentEngine.generateDrawDefinition({
    eventId,
  });
  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result.success).toEqual(true);

  let { flightProfile } = tournamentEngine.getFlightProfile({ eventId });
  expect(flightProfile.flights.length).toEqual(1);
});
