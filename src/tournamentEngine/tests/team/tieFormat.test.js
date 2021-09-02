import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { DOUBLES, SINGLES, TEAM } from '../../../constants/matchUpTypes';
import { COMPLETED } from '../../../constants/matchUpStatusConstants';
import { COMPETITOR } from '../../../constants/participantRoles';
import { PAIR } from '../../../constants/participantTypes';
import { UUID } from '../../../utilities';
import {
  INVALID_PARTICIPANT_TYPE,
  MATCHUP_NOT_FOUND,
  MISSING_DRAW_ID,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

/**
 * mocksEngine
 * 1. Generates 100 individual participants using 10 different nationality codes
 * 2. Generates a team event with specified tieFormat containing a draw of 8 teams
 * 3. Generates teams from the nationalityCode participant attribute
 *
 * after mocksEngine
 * 4. Add generated teams to the team event and draw entries
 * 5. Automate positioning of the team participants in the draw
 * 6. Assign a singles participant to a SINGLES tieMatchUp
 * 7. Assign a doubles participant to a DOUBLES tieMatchUp
 * 8.
 */
it('can generate draws in TEAM events with tieFormat and assign particiapnts to collectionPositions', () => {
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
        matchUpType: DOUBLES,
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

  // Assign a singles team participant to a collectionPosition
  let { matchUps: singlesMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [SINGLES] },
  });

  ({ drawDefinition, event } = tournamentEngine.getEvent({ drawId }));
  const { positionAssignments } = drawDefinition.structures[0];
  expect(positionAssignments.length).toEqual(drawSize);

  const sideNumber = 1;
  const singlesMatchUp = singlesMatchUps[0];
  let { matchUpTieId, matchUpId } = singlesMatchUp;
  let side1 = singlesMatchUp.sides.find(
    (side) => side.sideNumber === sideNumber
  );
  let teamParticipantIdSide1 = positionAssignments.find(
    (assignment) => assignment.drawPosition === side1.drawPosition
  ).participantId;
  let {
    tournamentParticipants: [teamParticipant],
  } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantIds: [teamParticipantIdSide1] },
  });
  let individualParticipantId = teamParticipant.individualParticipantIds[0];

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

  // assign an individual particpant to a SINGLES matchUp
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

  let modifiedTieMatchUp = singlesMatchUps.find(
    (matchUp) => matchUp.matchUpId === matchUpId
  );
  let targetSide = modifiedTieMatchUp.sides.find(
    (side) => side.sideNumber === sideNumber
  );
  expect(targetSide.participantId).toEqual(individualParticipantId);

  let { matchUps: dualMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
  });
  let dualMatchUp = dualMatchUps.find(
    (dualMatchUp) => (dualMatchUp.matchUpId = matchUpTieId)
  );
  let dualMatchUpTargetSide = dualMatchUp.sides.find(
    (side) => (side.sideNumber = sideNumber)
  );
  expect(dualMatchUpTargetSide.lineUp.length).toEqual(1);
  expect(dualMatchUpTargetSide.lineUp[0].participantId).toEqual(
    individualParticipantId
  );
  let targetCompetitor = dualMatchUpTargetSide.lineUp.find(
    ({ participantId }) => participantId === individualParticipantId
  );
  expect(targetCompetitor.collectionAssignments[0].collectionId).toEqual(
    singlesMatchUp.collectionId
  );

  // Assign a doubles team participant to a collectionPosition
  let { matchUps: doublesMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [DOUBLES] },
  });
  const doublesMatchUp = doublesMatchUps[0];
  ({ matchUpTieId, matchUpId } = doublesMatchUp);
  side1 = singlesMatchUp.sides.find((side) => side.sideNumber === sideNumber);
  teamParticipantIdSide1 = positionAssignments.find(
    (assignment) => assignment.drawPosition === side1.drawPosition
  ).participantId;
  ({
    tournamentParticipants: [teamParticipant],
  } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantIds: [teamParticipantIdSide1] },
  }));

  const individualParticipantIds =
    teamParticipant.individualParticipantIds.slice(0, 2);
  const pairParticipant = {
    participantType: PAIR,
    participantRole: COMPETITOR,
    individualParticipantIds,
  };
  result = tournamentEngine.addParticipant({ participant: pairParticipant });
  const pairParticipantId = result.participant.participantId;

  // cannot assign a singles participant to a doubles matchUp
  result = tournamentEngine.assignTieMatchUpParticipantId({
    drawId,
    sideNumber,
    tieMatchUpId: matchUpId,
    participantId: individualParticipantId,
  });
  expect(result.error).toEqual(INVALID_PARTICIPANT_TYPE);

  result = tournamentEngine.assignTieMatchUpParticipantId({
    drawId,
    sideNumber,
    tieMatchUpId: matchUpId,
    participantId: pairParticipantId,
  });
  expect(result.success).toEqual(true);

  ({ matchUps: doublesMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [DOUBLES] },
  }));

  modifiedTieMatchUp = doublesMatchUps.find(
    (matchUp) => matchUp.matchUpId === matchUpId
  );
  targetSide = modifiedTieMatchUp.sides.find(
    (side) => side.sideNumber === sideNumber
  );
  expect(targetSide.participantId).toEqual(pairParticipantId);

  ({ matchUps: dualMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
  }));
  dualMatchUp = dualMatchUps.find(
    (dualMatchUp) => (dualMatchUp.matchUpId = matchUpTieId)
  );
  dualMatchUpTargetSide = dualMatchUp.sides.find(
    (side) => (side.sideNumber = sideNumber)
  );
  expect(dualMatchUpTargetSide.lineUp.length).toEqual(2);
  expect(dualMatchUpTargetSide.lineUp[0].participantId).toEqual(
    individualParticipantId
  );
  targetCompetitor = dualMatchUpTargetSide.lineUp.find(
    ({ participantId }) => participantId === pairParticipantId
  );
  expect(targetCompetitor.collectionAssignments[0].collectionId).toEqual(
    doublesMatchUp.collectionId
  );

  // now extend to adding individual participant when no doubles participant exists
  // TODO: assignTieMatchUpParticipantId needs to create the pair participant
  /*
  result = tournamentEngine.assignTieMatchUpParticipantId({
    drawId,
    sideNumber,
    tieMatchUpId: matchUpId,
    participantId: individualParticipantId,
  });
  expect(result.success).toEqual(true);
  */

  // complete singlesMatchUps
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
    if (drawPositions.filter(Boolean).length === 2) {
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
    teamMatchUps.map((m) => m.score?.winningSide).filter(Boolean).length
  ).toEqual(4);
});
