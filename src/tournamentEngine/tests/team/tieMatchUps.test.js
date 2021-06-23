import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { DOUBLES, SINGLES, TEAM } from '../../../constants/matchUpTypes';
import { MISSING_ENTRIES } from '../../../constants/errorConditionConstants';
import { COMPLETED } from '../../../constants/matchUpStatusConstants';

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

  /*
  const { pendingMatchUps } = tournamentEngine.tournamentMatchUps();
  expect(pendingMatchUps.length).toEqual(70);
  */

  const { matchUps: teamMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
  });
  expect(teamMatchUps.length).toEqual(7);

  const { matchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [SINGLES, DOUBLES] },
  });
  expect(matchUps.length).toEqual(63);

  const { matchUps: singlesMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [SINGLES] },
  });
  expect(singlesMatchUps.length).toEqual(42);

  const { matchUps: doublesMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [DOUBLES] },
  });
  expect(doublesMatchUps.length).toEqual(21);

  ({ drawDefinition, event } = tournamentEngine.getEvent({ drawId }));
  const { positionAssignments } = drawDefinition.structures[0];
  expect(positionAssignments.length).toEqual(drawSize);

  const positionedParticipantIds = positionAssignments
    .filter(({ participantId }) => participantId)
    .map(({ participantId }) => participantId);
  expect(positionedParticipantIds.length).toEqual(drawSize);

  const { outcome } = mocksEngine.generateOutcomeFromScoreString({
    scoreString: '6-1 6-1',
    winningSide: 1,
    matchUpStatus: COMPLETED,
  });
  const { matchUpId } = singlesMatchUps[0];
  result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId,
    outcome,
  });
  expect(result.success).toEqual(true);

  const { completedMatchUps } = tournamentEngine.tournamentMatchUps();
  expect(completedMatchUps.length).toEqual(1);
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
