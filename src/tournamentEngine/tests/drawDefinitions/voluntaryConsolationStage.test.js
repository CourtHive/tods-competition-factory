import { mocksEngine, setSubscriptions } from '../../..';
import tournamentEngine from '../../sync';

import { VOLUNTARY_CONSOLATION } from '../../../constants/drawDefinitionConstants';
import { DIRECT_ACCEPTANCE } from '../../../constants/entryStatusConstants';
import { DELETE_DRAW_DEFINITIONS } from '../../../constants/auditConstants';
import {
  MISSING_DRAW_ID,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

// Needs to be refactored to reflect implementation changes
it.skip('can generate a draw with only voluntary consolation stage', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32 }],
  });

  tournamentEngine.setState(tournamentRecord);

  let result = tournamentEngine.addFlight({
    stage: VOLUNTARY_CONSOLATION,
    drawName: 'Voluntary',
    eventId,
  });
  expect(result.error).toEqual(MISSING_VALUE);

  result = tournamentEngine.addFlight({
    stage: VOLUNTARY_CONSOLATION,
    drawName: 'Voluntary',
    sourceDrawId: 'bogusId',
    eventId,
  });
  expect(result.error).toEqual(MISSING_DRAW_ID);

  result = tournamentEngine.addFlight({
    stage: VOLUNTARY_CONSOLATION,
    drawName: 'Voluntary',
    sourceDrawId: drawId,
    eventId,
  });
  expect(result.success).toEqual(true);

  let { flightProfile } = tournamentEngine.getFlightProfile({ eventId });
  expect(flightProfile.links.length).toEqual(1);

  const consolationDrawId = flightProfile.flights.find(
    (flight) => flight.flightNumber === 2
  ).drawId;

  const mainEntries = flightProfile.flights.find(
    (flight) => flight.flightNumber === 1
  ).drawEntries;
  const consolationParticipantIds = mainEntries.map(
    ({ participantId }) => participantId
  );

  result = tournamentEngine.addDrawEntries({
    participantIds: consolationParticipantIds,
    entryStage: VOLUNTARY_CONSOLATION,
    entryStatus: DIRECT_ACCEPTANCE,
    drawId: consolationDrawId,
    eventId,
  });
  expect(result.success).toEqual(true);

  flightProfile = tournamentEngine.getFlightProfile({ eventId }).flightProfile;
  const flight = flightProfile.flights.find(
    (flight) => flight.flightNumber === 2
  );
  expect(flight.drawEntries.length).toEqual(consolationParticipantIds.length);

  const { drawDefinition } = tournamentEngine.generateDrawDefinition({
    ...flight,
    drawSize: 32,
  });
  expect(drawDefinition.structures.length).toEqual(1);

  result = tournamentEngine.addDrawDefinition({
    drawDefinition,
    eventId,
    flight,
  });
  expect(result.success).toEqual(true);

  const voluntaryStructure = drawDefinition.structures.find(
    (structure) => structure.stage === VOLUNTARY_CONSOLATION
  );
  const positionedAssigned = voluntaryStructure.positionAssignments.every(
    (participantId) => participantId
  );
  expect(positionedAssigned).toEqual(true);

  let notificationsCounter = 0;
  const subscriptions = {
    audit: (notices) => {
      notificationsCounter += notices[0].length;
      expect(notices[0][0].action).toEqual(DELETE_DRAW_DEFINITIONS);
      expect(notices[0][0].payload.drawDefinitions).not.toBeUndefined();
    },
  };
  result = setSubscriptions({ subscriptions });

  result = tournamentEngine.deleteFlightAndFlightDraw({ eventId, drawId });
  expect(result.success).toEqual(true);

  expect(notificationsCounter).toEqual(2);

  const { event } = tournamentEngine.getEvent({ eventId });
  expect(event.drawDefinitions.length).toEqual(0);

  flightProfile = tournamentEngine.getFlightProfile({ eventId }).flightProfile;
  expect(flightProfile.flights).toEqual([]);
  expect(flightProfile.links).toEqual([]);
});
