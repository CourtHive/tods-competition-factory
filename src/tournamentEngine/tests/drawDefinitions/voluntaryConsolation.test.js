import { mocksEngine } from '../../..';
import tournamentEngine from '../../sync';

import { VOLUNTARY_CONSOLATION } from '../../../constants/drawDefinitionConstants';
import { DIRECT_ACCEPTANCE } from '../../../constants/entryStatusConstants';

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

  result = tournamentEngine.generateVoluntaryConsolation({
    automated: true,
    drawId,
  });
  expect(result.success).toEqual(true);
  expect(result.links.length).toEqual(0);
  expect(result.structures.length).toEqual(1);

  const { matchUps } = tournamentEngine.allTournamentMatchUps({
    contextFilters: { stages: [VOLUNTARY_CONSOLATION] },
  });
  expect(matchUps.length).toEqual(31);

  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  const { positionAssignments } = drawDefinition.structures.find(
    ({ stage }) => stage === VOLUNTARY_CONSOLATION
  );
  expect(positionAssignments.length).toEqual(32);
  const assignedPositions = positionAssignments.filter(
    ({ participantId }) => participantId
  );
  expect(assignedPositions.length).toEqual(32);
});

it('can generate a draw with voluntary consolation stage and delay attachment', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        drawSize: 32,
        voluntaryConsolation: { structureName: 'Voluntary Consolation' },
      },
    ],
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

  result = tournamentEngine.generateVoluntaryConsolation({
    attachConsolation: false,
    automated: true,
    drawId,
  });
  expect(result.success).toEqual(true);
  expect(result.links.length).toEqual(0);
  expect(result.structures.length).toEqual(1);

  let { matchUps } = tournamentEngine.allTournamentMatchUps({
    contextFilters: { stages: [VOLUNTARY_CONSOLATION] },
  });
  expect(matchUps.length).toEqual(0);

  result = tournamentEngine.attachConsolationStructures({
    structures: result.structures,
    links: result.links,
    drawId,
  });

  matchUps = tournamentEngine.allTournamentMatchUps({
    contextFilters: { stages: [VOLUNTARY_CONSOLATION] },
  }).matchUps;
  expect(matchUps.length).toEqual(31);

  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  const { positionAssignments } = drawDefinition.structures.find(
    ({ stage }) => stage === VOLUNTARY_CONSOLATION
  );
  expect(positionAssignments.length).toEqual(32);
  const assignedPositions = positionAssignments.filter(
    ({ participantId }) => participantId
  );
  expect(assignedPositions.length).toEqual(32);

  result = tournamentEngine.getDrawData({ drawId });
  expect(result.success).toEqual(true);
});
