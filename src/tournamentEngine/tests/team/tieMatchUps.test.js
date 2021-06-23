import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { DOUBLES, SINGLES, TEAM } from '../../../constants/matchUpTypes';
import { MISSING_ENTRIES } from '../../../constants/errorConditionConstants';

it('can generate draws in TEAM events with tieFormat', () => {
  const nationalityCodesCount = 10;
  const participantsProfile = {
    participantsCount: 100,
    nationalityCodesCount,
  };

  const drawSize = 8;
  const eventProfiles = [
    {
      eventName: 'Test Team Event',
      eventType: TEAM,
      category: {
        categoryName: 'U12',
      },
      drawProfiles: [
        {
          drawSize,
          drawName: 'Main Draw',
        },
      ],
    },
  ];

  const {
    eventIds: [eventId],
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    participantsProfile,
    eventProfiles,
  });
  expect(eventId).not.toBeUndefined();
  expect(drawId).not.toBeUndefined();

  tournamentEngine.setState(tournamentRecord);

  let result = tournamentEngine.generateTeamsFromParticipantAttribute({
    personAttribute: 'nationalityCode',
  });
  expect(result.success).toEqual(true);

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    { participantFilters: { participantTypes: [TEAM] } }
  );
  // since teams are generated from nationalityCodes expect there to be
  // the same number of teams as nationalityCodes
  expect(tournamentParticipants.length).toEqual(nationalityCodesCount);

  /*
  const { pendingMatchUps } = tournamentEngine.tournamentMatchUps();
  expect(pendingMatchUps.length).toEqual(70);
  */

  const participantIds = tournamentParticipants
    .map((p) => p.participantId)
    .slice(0, drawSize);

  // expect error: can't add to draw if not in event
  result = tournamentEngine.addDrawEntries({
    participantIds,
    eventId,
    drawId,
  });
  expect(result.error).toEqual(MISSING_ENTRIES);

  // can add to event and draw at same time
  result = tournamentEngine.addEventEntries({
    participantIds,
    eventId,
    drawId,
  });
  expect(result.success).toEqual(true);

  let { drawDefinition, event } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.entries.length).toEqual(participantIds.length);
  expect(event.entries.length).toEqual(participantIds.length);

  const { flightProfile } = tournamentEngine.getFlightProfile({ eventId });
  expect(flightProfile.flights.length).toEqual(1);
  expect(flightProfile.flights[0].drawEntries.length).toEqual(
    participantIds.length
  );

  const structureId = drawDefinition.structures[0].structureId;
  result = tournamentEngine.automatedPositioning({
    drawId,
    structureId,
  });

  let { matchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
  });

  expect(matchUps.length).toEqual(7);

  ({ matchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [SINGLES, DOUBLES] },
  }));
  expect(matchUps.length).toEqual(63);

  ({ drawDefinition, event } = tournamentEngine.getEvent({ drawId }));
  const { positionAssignments } = drawDefinition.structures[0];
  const positionedParticipantIds = positionAssignments
    .filter(({ participantId }) => participantId)
    .map(({ participantId }) => participantId);
  expect(positionedParticipantIds.length).toEqual(drawSize);
});

it('can generate drawDefinition for TEAM event', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    startDate: '2020-01-01',
    endDate: '2020-01-06',
  });

  tournamentEngine.setState(tournamentRecord);

  const eventName = 'Test Event';
  const event = {
    eventName,
    eventType: TEAM,
  };

  let result = tournamentEngine.addEvent({ event });
  const { event: eventResult, success } = result;
  const { eventId } = eventResult;
  expect(success).toEqual(true);

  /*
  const participantIds = participants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result).toEqual(SUCCESS);
  */

  const values = {
    automated: true,
    drawSize: 32,
    eventId,
    event: eventResult,
    matchUpType: TEAM,
  };
  tournamentEngine.generateDrawDefinition(values);
});
