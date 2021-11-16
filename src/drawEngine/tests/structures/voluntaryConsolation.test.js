it('needs to be refactored', () => {
  expect(true);
});
/*
import { findExtension } from '../../../tournamentEngine/governors/queryGovernor/extensionQueries';
import { getParticipantIds } from '../../../global/functions/extractors';
import tournamentEngine from '../../../tournamentEngine/sync';
import mocksEngine from '../../../mocksEngine';

import { FORMAT_STANDARD } from '../../../fixtures/scoring/matchUpFormats';
import { ENTRY_PROFILE } from '../../../constants/extensionConstants';
import { SINGLES } from '../../../constants/eventConstants';
import {
  COMPASS,
  QUALIFYING,
  VOLUNTARY_CONSOLATION,
} from '../../../constants/drawDefinitionConstants';

const scenarios = [{}, { category: { categoryName: 'U12' } }];
it.each(scenarios)(
  'can add draw with empty voluntary consolation stage',
  (scenario) => {
    const qualifyingDrawSize = 16;
    const qualifyingPositions = 4;
    const mainDrawSize = 32;
    const eventProfiles = [
      {
        ...scenario,
        eventName: 'Event Flights Test',
        eventType: SINGLES,
        matchUpFormat: FORMAT_STANDARD,
        drawProfiles: [
          {
            drawSize: qualifyingDrawSize,
            drawName: 'Qualifying Draw',
            stage: QUALIFYING,
          },
          {
            drawSize: mainDrawSize,
            drawName: 'Main Draw',
            qualifyingPositions,
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
      tournamentRecord,
    } = mocksEngine.generateTournamentRecord({
      eventProfiles,
    });

    tournamentEngine.setState(tournamentRecord);

    const { tournamentParticipants } =
      tournamentEngine.getTournamentParticipants();
    expect(tournamentParticipants.length).toBeGreaterThanOrEqual(
      qualifyingDrawSize + mainDrawSize - qualifyingPositions
    );

    const { flightProfile } = tournamentEngine.getFlightProfile({ eventId });
    expect(flightProfile.flights[0].drawEntries.length).toEqual(16);
    expect(flightProfile.flights[1].drawEntries.length).toEqual(28);
    expect(flightProfile.flights[2].drawEntries.length).toEqual(0);

    expect(drawIds.length).toEqual(3);
    const { tournamentRecord: updatedTournamentRecord } =
      tournamentEngine.getState();
    expect(updatedTournamentRecord.events[0].drawDefinitions.length).toEqual(3);
    expect(
      updatedTournamentRecord.events[0].drawDefinitions[1].drawType
    ).toEqual(COMPASS);
  }
);

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
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    participantsCount: 8,
    drawProfiles,
  });

  const { drawDefinition } = tournamentEngine
    .setState(tournamentRecord)
    .getEvent({ drawId });
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
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  let {
    flightProfile: { flights },
  } = tournamentEngine.getFlightProfile({ eventId });
  let flight = flights[0];

  const consolationParticipantIds = getParticipantIds(flight.drawEntries).slice(
    0,
    drawSize / 2
  );

  result = tournamentEngine.addVoluntaryConsolationStage({
    drawId,
    drawSize: consolationParticipantIds.length,
  });
  expect(result.success).toEqual(true);

  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { extension } = findExtension({
    element: drawDefinition,
    name: ENTRY_PROFILE,
  });
  expect(extension.value[VOLUNTARY_CONSOLATION].drawSize).toEqual(
    consolationParticipantIds.length
  );

  result = tournamentEngine.addDrawEntries({
    participantIds: consolationParticipantIds,
    entryStage: VOLUNTARY_CONSOLATION,
    eventId,
    drawId,
  });
  expect(result.success).toEqual(true);

  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
  let voluntaryEntries = drawDefinition.entries.filter(
    ({ entryStage }) => entryStage === VOLUNTARY_CONSOLATION
  );
  expect(voluntaryEntries.length).toEqual(consolationParticipantIds.length);

  ({
    flightProfile: { flights },
  } = tournamentEngine.getFlightProfile({ eventId }));

  flight = flights[0];

  voluntaryEntries = flight.drawEntries.filter(
    ({ entryStage }) => entryStage === VOLUNTARY_CONSOLATION
  );
  expect(voluntaryEntries.length).toEqual(consolationParticipantIds.length);

  result = tournamentEngine.generateVoluntaryConsolationStructure({
    drawId,
    automated: true,
  });
  expect(result.success).toEqual(true);

  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
  const voluntaryConsolationStructure = drawDefinition.structures.find(
    ({ stage }) => stage === VOLUNTARY_CONSOLATION
  );
  const assignedPositions =
    voluntaryConsolationStructure.positionAssignments.filter(
      ({ participantId }) => participantId
    );
  expect(assignedPositions.length).toEqual(consolationParticipantIds.length);
});
*/
