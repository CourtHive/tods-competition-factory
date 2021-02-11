import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { INDIVIDUAL } from '../../../constants/participantTypes';

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
  expect(flightProfile.flights[0].entries.length).toEqual(11);
  expect(flightProfile.flights[1].entries.length).toEqual(11);
  expect(flightProfile.flights[2].entries.length).toEqual(10);
});
