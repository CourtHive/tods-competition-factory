import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { DOUBLES, SINGLES, TEAM } from '../../../constants/matchUpTypes';
import { COMPETITOR } from '../../../constants/participantRoles';
import { PAIR } from '../../../constants/participantTypes';
import {
  EXISTING_OUTCOME,
  MATCHUP_NOT_FOUND,
  MISSING_DRAW_ID,
  MISSING_SIDE_NUMBER,
} from '../../../constants/errorConditionConstants';
import {
  COMPLETED,
  TO_BE_PLAYED,
} from '../../../constants/matchUpStatusConstants';

it('can both assign and remove singles individualParticipants in team events', () => {
  const { tournamentRecord, drawId } = generateTeamTournament();
  tournamentEngine.setState(tournamentRecord);

  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { positionAssignments } = drawDefinition.structures[0];

  let { matchUps: singlesMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [SINGLES] },
  });

  const singlesMatchUp = singlesMatchUps[0];
  let { matchUpId } = singlesMatchUp;
  const drawPositions = singlesMatchUp.drawPositions;
  const teamParticipantIds = positionAssignments
    .filter(({ drawPosition }) => drawPositions.includes(drawPosition))
    .map(({ participantId }) => participantId);

  let { tournamentParticipants: teamParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantIds: teamParticipantIds },
    });

  const assignedIndividualParticipantIds = [];

  // assign individual participants to the first singles matchUp
  teamParticipants.forEach((teamParticipant) => {
    const { participantId } = teamParticipant;
    const assignment = positionAssignments.find(
      (assignment) => assignment.participantId === participantId
    );
    const side = singlesMatchUp.sides.find(
      (side) => side.drawPosition === assignment.drawPosition
    );
    const { sideNumber } = side;
    const individualParticipantId = teamParticipant.individualParticipantIds[0];
    assignedIndividualParticipantIds.push(individualParticipantId);
    const result = tournamentEngine.assignTieMatchUpParticipantId({
      participantId: individualParticipantId,
      tieMatchUpId: matchUpId,
      sideNumber,
      drawId,
    });
    expect(result.success).toEqual(true);
    expect(result.modifiedLineUp[0].participantId).toEqual(
      individualParticipantId
    );
    expect(
      result.modifiedLineUp[0].collectionAssignments[0].collectionId
    ).toEqual(singlesMatchUp.collectionId);
    expect(
      result.modifiedLineUp[0].collectionAssignments[0].collectionPosition
    ).toEqual(singlesMatchUp.collectionPosition);
  });

  // score the SINGLES matchUp
  let { outcome } = mocksEngine.generateOutcome(singlesMatchUp);
  let result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId,
    outcome,
  });
  expect(result.success).toEqual(true);

  // attempt to remove participants from SINGLES matchUp; expect error
  result = removeParticipants();
  expect(result.error).toEqual(EXISTING_OUTCOME);

  // remove the result from SINGLES matchUp
  ({ outcome } = mocksEngine.generateOutcomeFromScoreString({
    winningSide: undefined,
    matchUpStatus: TO_BE_PLAYED,
  }));
  result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId,
    outcome,
  });
  expect(result.success).toEqual(true);

  // attempt to remove participants from SINGLES matchUp; expect success
  result = removeParticipants();
  expect(result.success).toEqual(true);
  expect(
    assignedIndividualParticipantIds.includes(
      result.modifiedLineUp[0].participantId
    )
  ).toEqual(true);
  expect(result.modifiedLineUp[0].collectionAssignments.length).toEqual(0);

  function removeParticipants() {
    // remove individual participants to the first singles matchUp
    for (const teamParticipant of teamParticipants) {
      const { participantId } = teamParticipant;
      const assignment = positionAssignments.find(
        (assignment) => assignment.participantId === participantId
      );
      const side = singlesMatchUp.sides.find(
        (side) => side.drawPosition === assignment.drawPosition
      );
      const { sideNumber } = side;
      return tournamentEngine.assignTieMatchUpParticipantId({
        tieMatchUpId: matchUpId,
        sideNumber,
        drawId,
      });
    }
  }
});

it('can assign SINGLES particiapnts to collectionPositions and complete matchUps', () => {
  const drawSize = 8;
  const valueGoal = 2;
  const { tournamentRecord, eventId, drawId } = generateTeamTournament({
    drawSize,
    valueGoal,
  });
  expect(eventId).not.toBeUndefined();
  expect(drawId).not.toBeUndefined();

  tournamentEngine.setState(tournamentRecord);

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    { participantFilters: { participantTypes: [TEAM] } }
  );
  expect(tournamentParticipants.length).toEqual(drawSize);

  // Assign a singles team participant to a collectionPosition
  let { matchUps: singlesMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [SINGLES] },
  });

  let { drawDefinition, event } = tournamentEngine.getEvent({ drawId });
  expect(event.tieFormat.winCriteria.valueGoal).toEqual(valueGoal);

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

  let result = tournamentEngine.assignTieMatchUpParticipantId();
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
  expect(result.error).toEqual(MISSING_SIDE_NUMBER);

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
  expect(teamMatchUps[0].winningSide).toEqual(1);
  expect(teamMatchUps[0].score.sets[0].side1Score).toEqual(2);

  // expect that all 4 first round matchUps are complete
  expect(teamMatchUps.map((m) => m.winningSide).filter(Boolean).length).toEqual(
    4
  );
});

function generateTeamTournament({ drawSize = 8, valueGoal = 2 } = {}) {
  const participantsProfile = { participantsCount: 100 };

  const tieFormat = {
    winCriteria: { valueGoal },
    collectionDefinitions: [
      {
        collectionId: 'doublesCollectionId',
        collectionName: 'Doubles',
        matchUpType: DOUBLES,
        matchUpCount: 1,
        matchUpFormat: 'SET3-S:6/TB7-F:TB10',
        matchUpValue: 1,
      },
      {
        collectionId: 'singlesCollectionId',
        collectionName: 'Singles',
        matchUpType: SINGLES,
        matchUpCount: 2,
        matchUpFormat: 'SET3-S:6/TB7',
        matchUpValue: 1,
      },
    ],
  };

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

  return { tournamentRecord, eventId, drawId };
}
