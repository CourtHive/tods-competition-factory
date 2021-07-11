import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { DOUBLES, SINGLES, TEAM } from '../../../constants/matchUpTypes';
import { COMPLETED } from '../../../constants/matchUpStatusConstants';
import { UUID } from '../../../utilities';
import {
  MATCHUP_NOT_FOUND,
  MISSING_DRAW_ID,
  MISSING_ENTRIES,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

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
      category: { categoryName: 'Junior' },
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
});

it('can generate draws in TEAM events with tieFormat', () => {
  const nationalityCodesCount = 10;
  const participantsProfile = {
    participantsCount: 100,
    nationalityCodesCount,
  };

  const singlesCollectionId = UUID();
  const doublesCollectionId = UUID();
  const valueGoal = 2;
  const tieFormat = {
    winCriteria: { valueGoal },
    collectionDefinitions: [
      {
        collectionId: doublesCollectionId,
        collectionName: 'Doubles',
        matchUpType: 'DOUBLES',
        matchUpCount: 1,
        matchUpFormat: 'SET3-S:6/TB7-F:TB10',
        matchUpValue: 1,
      },
      {
        collectionId: singlesCollectionId,
        collectionName: 'Singles',
        matchUpType: SINGLES,
        matchUpCount: 2,
        matchUpFormat: 'SET3-S:6/TB7',
        matchUpValue: 1,
      },
    ],
  };

  const drawSize = 8;
  const eventProfiles = [
    {
      eventType: TEAM,
      eventName: 'Test Team Event',
      category: { categoryName: 'Junior' },
      tieFormat,
      drawProfiles: [
        {
          drawSize,
          tieFormat,
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

  // can add to event and draw at same time
  result = tournamentEngine.addEventEntries({
    participantIds,
    eventId,
    drawId,
  });
  expect(result.success).toEqual(true);

  let { drawDefinition, event } = tournamentEngine.getEvent({ drawId });
  expect(event.tieFormat.winCriteria.valueGoal).toEqual(valueGoal);

  const structureId = drawDefinition.structures[0].structureId;
  result = tournamentEngine.automatedPositioning({
    drawId,
    structureId,
  });

  let { matchUps: singlesMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [SINGLES] },
  });

  ({ drawDefinition, event } = tournamentEngine.getEvent({ drawId }));
  const { positionAssignments } = drawDefinition.structures[0];
  expect(positionAssignments.length).toEqual(drawSize);

  const sideNumber = 1;
  const singlesMatchUp = singlesMatchUps[0];
  const { matchUpTieId, matchUpId } = singlesMatchUp;
  const side1 = singlesMatchUp.sides.find(
    (side) => side.sideNumber === sideNumber
  );
  const teamParticipantIdSide1 = positionAssignments.find(
    (assignment) => assignment.drawPosition === side1.drawPosition
  ).participantId;
  const {
    tournamentParticipants: [teamParticipant],
  } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantIds: [teamParticipantIdSide1] },
  });
  const individualParticipantId = teamParticipant.individualParticipantIds[0];

  result = tournamentEngine.assignTieMatchUpParticipantId();
  expect(result.error).toEqual(MISSING_DRAW_ID);

  result = tournamentEngine.assignTieMatchUpParticipantId({
    drawId,
    participantId: individualParticipantId,
  });
  expect(result.error).toEqual(MATCHUP_NOT_FOUND);

  result = tournamentEngine.assignTieMatchUpParticipantId({
    drawId,
    tieMatchUpId: matchUpId,
  });
  expect(result.error).toEqual(PARTICIPANT_NOT_FOUND);

  result = tournamentEngine.assignTieMatchUpParticipantId({
    drawId,
    sideNumber,
    tieMatchUpId: matchUpId,
    participantId: individualParticipantId,
  });
  expect(result.success).toEqual(true);

  ({ matchUps: singlesMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [SINGLES] },
  }));

  const modifiedTieMatchUp = singlesMatchUps.find(
    (matchUp) => matchUp.matchUpId === matchUpId
  );
  const targetSide = modifiedTieMatchUp.sides.find(
    (side) => side.sideNumber === sideNumber
  );
  expect(targetSide.participantId).toEqual(individualParticipantId);

  const { matchUps: dualMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
  });
  const dualMatchUp = dualMatchUps.find(
    (dualMatchUp) => (dualMatchUp.matchUpId = matchUpTieId)
  );
  const dualMatchUpTargetSide = dualMatchUp.sides.find(
    (side) => (side.sideNumber = sideNumber)
  );
  expect(dualMatchUpTargetSide.lineUp.length).toEqual(1);
  expect(dualMatchUpTargetSide.lineUp[0].participantId).toEqual(
    individualParticipantId
  );
  expect(
    dualMatchUpTargetSide.lineUp[0].collectionAssignments[0].collectionId
  ).toEqual(singlesMatchUp.collectionId);

  const { outcome } = mocksEngine.generateOutcomeFromScoreString({
    scoreString: '6-1 6-1',
    winningSide: 1,
    matchUpStatus: COMPLETED,
  });

  singlesMatchUps.forEach(({ matchUpId, drawPositions }) => {
    result = tournamentEngine.setMatchUpStatus({
      drawId,
      matchUpId,
      outcome,
    });
    if (drawPositions.filter((f) => f).length === 2) {
      expect(result.success).toEqual(true);
    } else {
      expect(result.error).not.toBeUndefined();
    }
  });

  const { matchUps: teamMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
  });
  expect(teamMatchUps[0].score.winningSide).toEqual(1);
  expect(teamMatchUps[0].score.sets[0].side1Score).toEqual(2);

  // expect that all 4 first round matchUps are complete
  expect(
    teamMatchUps.map((m) => m.score?.winningSide).filter((f) => f).length
  ).toEqual(4);

  // console.log(teamMatchUps[0].sides);
});
