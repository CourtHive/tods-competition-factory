import { mocksEngine } from '../../..';
import tournamentEngine from '../../sync';

import { VOLUNTARY_CONSOLATION } from '../../../constants/drawDefinitionConstants';
import { DIRECT_ACCEPTANCE } from '../../../constants/entryStatusConstants';

// Needs to be refactored to reflect implementation changes
it('can generate a draw with voluntary consolation stage', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32, voluntaryConsolation: {} }],
  });

  tournamentEngine.setState(tournamentRecord);

  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.structures.length).toEqual(2);

  let { flightProfile } = tournamentEngine.getFlightProfile({ eventId });

  const mainEntries = flightProfile.flights.find(
    (flight) => flight.flightNumber === 1
  ).drawEntries;
  const consolationParticipantIds = mainEntries.map(
    ({ participantId }) => participantId
  );

  let result = tournamentEngine.addDrawEntries({
    participantIds: consolationParticipantIds,
    entryStage: VOLUNTARY_CONSOLATION,
    entryStatus: DIRECT_ACCEPTANCE,
    drawId,
  });
  expect(result.success).toEqual(true);

  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;

  const vcstageEntries = drawDefinition.entries.filter(
    (e) => e.entryStage === VOLUNTARY_CONSOLATION
  );

  expect(vcstageEntries.length).toEqual(32);
});
