import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../../tournamentEngine/sync';

import { FORMAT_STANDARD } from '../../../fixtures/scoring/matchUpFormats/formatConstants';
import { SINGLES } from '../../../constants/eventConstants';
import {
  COMPASS,
  QUALIFYING,
  VOLUNTARY_CONSOLATION,
} from '../../../constants/drawDefinitionConstants';

it('can add draw with empty voluntary consolation stage', () => {
  const eventProfiles = [
    {
      eventName: 'Event Flights Test',
      eventType: SINGLES,
      category: {
        categoryName: 'U12',
      },
      matchUpFormat: FORMAT_STANDARD,
      drawProfiles: [
        {
          drawSize: 16,
          drawName: 'Qualifying Draw',
          stage: QUALIFYING,
        },
        {
          drawSize: 32,
          qualifyingPositions: 4,
          drawName: 'Main Draw',
          drawType: COMPASS,
        },
        {
          drawName: 'Consolation Draw',
          stage: VOLUNTARY_CONSOLATION,
        },
      ],
    },
  ];
  const {
    eventIds: [eventId],
    drawIds,
  } = mocksEngine.generateTournamentRecord({
    eventProfiles,
  });

  const { flightProfile } = tournamentEngine.getFlightProfile({ eventId });
  expect(flightProfile.flights[0].drawEntries.length).toEqual(16);
  expect(flightProfile.flights[1].drawEntries.length).toEqual(28);
  expect(flightProfile.flights[2].drawEntries.length).toEqual(0);

  expect(drawIds.length).toEqual(3);
  const { tournamentRecord } = tournamentEngine.getState();
  expect(tournamentRecord.events[0].drawDefinitions.length).toEqual(3);
  expect(tournamentRecord.events[0].drawDefinitions[1].drawType).toEqual(
    COMPASS
  );
});

it('can add draw with voluntary consolation stage', () => {
  const drawSize = 8;
  const drawProfiles = [
    {
      drawSize,
      stage: VOLUNTARY_CONSOLATION,
    },
  ];
  const {
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    participantsCount: 8,
    drawProfiles,
  });

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.structures[0].positionAssignments.length).toEqual(
    drawSize
  );
  expect(drawDefinition.structures[0].stage).toEqual(VOLUNTARY_CONSOLATION);
});

it('can add voluntary consolation structure to an existing draw', () => {
  const drawSize = 32;
  const drawProfiles = [
    {
      drawSize,
    },
  ];
  const {
    drawIds: [drawId],
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });

  let {
    flightProfile: {
      flights: [flight],
    },
  } = tournamentEngine.getFlightProfile({ eventId });

  const consolationParticipantIds = flight.drawEntries
    .map(({ participantId }) => participantId)
    .slice(0, drawSize / 2);

  let result = tournamentEngine.addVoluntaryConsolationStage({
    drawId,
    drawSize: consolationParticipantIds.length,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.addDrawEntries({
    participantIds: consolationParticipantIds,
    entryStage: VOLUNTARY_CONSOLATION,
    eventId,
    drawId,
  });
  expect(result.success).toEqual(true);

  ({
    flightProfile: {
      flights: [flight],
    },
  } = tournamentEngine.getFlightProfile({ eventId }));

  const voluntaryEntries = flight.drawEntries.filter(
    ({ entryStage }) => entryStage === VOLUNTARY_CONSOLATION
  );
  expect(voluntaryEntries.length).toEqual(consolationParticipantIds.length);

  result = tournamentEngine.generateVoluntaryConsolationStructure({
    drawId,
    automated: true,
  });
  expect(result.success).toEqual(true);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const voluntaryConsolationStructure = drawDefinition.structures.find(
    ({ stage }) => stage === VOLUNTARY_CONSOLATION
  );
  const assignedPositions =
    voluntaryConsolationStructure.positionAssignments.filter(
      ({ participantId }) => participantId
    );
  expect(assignedPositions.length).toEqual(consolationParticipantIds.length);
});
