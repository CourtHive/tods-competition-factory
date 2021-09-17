import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { DOUBLES, SINGLES, TEAM } from '../../../constants/matchUpTypes';
import { COMPLETED } from '../../../constants/matchUpStatusConstants';

/**
 * mocksEngine
 * 1. Generates 100 individual participants using 10 different nationality codes
 * 2. Generates a team event containing a draw of 8 teams
 *
 * after mocksEngine
 * 3. Since no tieFormat was provided the default of 6 singles / 3 doubles was used
 * 4. Automate positioning of the team participants in the draw
 * 5. Complete one singles matchUp within one dual match
 * 6. Confirm that the score of the dual matchUp is 1-0
 */
it('can generate TEAM events', () => {
  const nationalityCodesCount = 10;
  const participantsProfile = {
    participantsCount: 100,
    nationalityCodesCount,
  };

  const drawSize = 8;
  const eventProfiles = [
    {
      eventType: TEAM,
      eventName: 'Test Team Event',
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
  const tournamentId = tournamentRecord.tournamentId;

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    { participantFilters: { participantTypes: [TEAM] } }
  );
  // since teams are generated from nationalityCodes expect there to be
  // the same number of teams as nationalityCodes
  expect(tournamentParticipants.length).toEqual(drawSize);

  let { drawDefinition, event } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.entries.length).toEqual(drawSize);
  expect(event.entries.length).toEqual(drawSize);

  const { flightProfile } = tournamentEngine.getFlightProfile({ eventId });
  expect(flightProfile.flights.length).toEqual(1);
  expect(flightProfile.flights[0].drawEntries.length).toEqual(drawSize);

  const structureId = drawDefinition.structures[0].structureId;
  let result = tournamentEngine.automatedPositioning({
    drawId,
    structureId,
  });

  const { matchUps: teamMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
  });
  expect(teamMatchUps.length).toEqual(7);

  const { matchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [SINGLES, DOUBLES] },
  });
  // since no tieFormat was provided the default # of matchUps is 6 SINGLES, 3 DOUBLES
  // there are 7 standard elimination TEAM matchUps * 9 = 63
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

  // only the 4 first round TEAM matchUps are considered upcoming
  // because the collectionAssignments have not yet been made for the SINGLES/DOUBLES matchUps
  const { upcomingMatchUps } = tournamentEngine.tournamentMatchUps();
  expect(upcomingMatchUps.length).toEqual(4);
  expect(upcomingMatchUps[0].score.sets).toEqual([
    { side1Score: 1, side2Score: 0 },
  ]);
  expect(upcomingMatchUps[0].score.scoreStringSide1).toEqual('1-0');

  // all other SINGLES/DOUBLES/TEAM matchUps are pending
  const { pendingMatchUps } = tournamentEngine.tournamentMatchUps();
  expect(pendingMatchUps.length).toEqual(65);

  const { matchUp } = tournamentEngine.findMatchUp({
    drawId,
    matchUpId,
    inContext: true,
  });

  expect(matchUp.eventId).toEqual(eventId);
  expect(matchUp.tournamentId).toEqual(tournamentId);

  const { matchUp: dualMatchUp } = tournamentEngine.findMatchUp({
    drawId,
    matchUpId: upcomingMatchUps[0].matchUpId,
    inContext: true,
  });

  expect(dualMatchUp.eventId).toEqual(eventId);
  expect(dualMatchUp.tournamentId).toEqual(tournamentId);
  expect(dualMatchUp.tieMatchUps[0].eventId).toEqual(eventId);
});
