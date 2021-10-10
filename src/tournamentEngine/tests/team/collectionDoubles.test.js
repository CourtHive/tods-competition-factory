import { getParticipantId } from '../../../global/functions/extractors';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { EXISTING_OUTCOME } from '../../../constants/errorConditionConstants';
import { DOUBLES, SINGLES, TEAM } from '../../../constants/matchUpTypes';
import { TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';

it.only('can both assign and remove individualParticipants in DOUBLES matchUps that are part of team events', () => {
  const { tournamentRecord, drawId } = generateTeamTournament();
  tournamentEngine.setState(tournamentRecord);

  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { positionAssignments } = drawDefinition.structures[0];

  let {
    matchUps: [doublesMatchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [DOUBLES] },
  });

  let { matchUpId } = doublesMatchUp;
  const drawPositions = doublesMatchUp.drawPositions;
  const teamParticipantIds = positionAssignments
    .filter(({ drawPosition }) => drawPositions.includes(drawPosition))
    .map(getParticipantId);

  let { tournamentParticipants: teamParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantIds: teamParticipantIds },
    });

  const assignedIndividualParticipantIds = [];

  // assign individual participants to the first doubles matchUp
  teamParticipants.forEach((teamParticipant) => {
    const { participantId } = teamParticipant;
    const assignment = positionAssignments.find(
      (assignment) => assignment.participantId === participantId
    );
    const side = doublesMatchUp.sides.find(
      (side) => side.drawPosition === assignment.drawPosition
    );
    const { sideNumber } = side;

    const individualParticipantIds =
      teamParticipant.individualParticipantIds.slice(0, 2);
    assignedIndividualParticipantIds.push(...individualParticipantIds);

    individualParticipantIds.forEach((individualParticipantId, i) => {
      const result = tournamentEngine.assignTieMatchUpParticipantId({
        participantId: individualParticipantId,
        tieMatchUpId: matchUpId,
        sideNumber,
        drawId,
      });
      expect(result.success).toEqual(true);
      expect(result.modifiedLineUp[i].participantId).toEqual(
        individualParticipantId
      );
      expect(
        result.modifiedLineUp[i].collectionAssignments[0].collectionId
      ).toEqual(doublesMatchUp.collectionId);
      expect(
        result.modifiedLineUp[i].collectionAssignments[0].collectionPosition
      ).toEqual(doublesMatchUp.collectionPosition);
    });
  });

  ({
    matchUps: [doublesMatchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpIds: [doublesMatchUp.matchUpId] },
  }));
  expect(doublesMatchUp.matchUpId).toEqual(matchUpId);

  expect(doublesMatchUp.matchUpType).toEqual(DOUBLES);
  /*
  doublesMatchUp.sides.forEach((side) => {
    console.log('d', { side });
    // expect(side.participant.participantType).toEqual(PAIR);
  });
  */

  // Assign a different individualParticipantId ###############################################

  // score the DOUBLES matchUp
  let { outcome } = mocksEngine.generateOutcome(doublesMatchUp);
  let result = tournamentEngine.setMatchUpStatus({
    matchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  ({
    matchUps: [doublesMatchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpIds: [doublesMatchUp.matchUpId] },
  }));
  expect(doublesMatchUp.winningSide).toEqual(outcome.winningSide);

  // attempt to remove participants from DOUBLES matchUp; expect error
  result = removeDoublesParticipants();
  expect(result.error).toEqual(EXISTING_OUTCOME);

  // remove the result from DOUBLES matchUp
  ({ outcome } = mocksEngine.generateOutcomeFromScoreString({
    matchUpStatus: TO_BE_PLAYED,
    winningSide: undefined,
  }));
  result = tournamentEngine.setMatchUpStatus({
    matchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  // attempt to remove participants from SINGLES matchUp; expect success
  // result = removeDoublesParticipants({ sideMember: 1 });
  // expect(result[0].success).toEqual(true);
  // expect(result[1].success).toEqual(true);

  /*
  let {
    matchUps: [teamMatchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpIds: [doublesMatchUp.matchUpTieId] },
  });

  teamMatchUp.sides.forEach((side) => {
    expect(side.lineUp[0].collectionAssignments.length).toEqual(0);
    expect(side.lineUp[1].collectionAssignments.length).toEqual(1);
  });
  */

  // result = removeDoublesParticipants({ sideMember: 2 });

  /*
  ({
    matchUps: [teamMatchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpIds: [doublesMatchUp.matchUpTieId] },
    inContext: false,
  }));

  teamMatchUp.sides.forEach((side) => {
    expect(side.lineUp[0].collectionAssignments.length).toEqual(0);
    expect(side.lineUp[1].collectionAssignments.length).toEqual(0);
  });
  */

  function removeDoublesParticipants({ sideMember = 1 } = {}) {
    const results = [];
    // remove individual participants from the DOUBLES matchUp
    const success = teamParticipants.every((teamParticipant) => {
      const { participantId } = teamParticipant;
      const assignment = positionAssignments.find(
        (assignment) => assignment.participantId === participantId
      );
      const side = doublesMatchUp.sides.find(
        (side) => side.drawPosition === assignment.drawPosition
      );
      const { sideNumber } = side;
      result = tournamentEngine.assignTieMatchUpParticipantId({
        tieMatchUpId: matchUpId,
        sideMember,
        sideNumber,
        drawId,
      });
      results.push(result);

      return !result?.error;
    });

    return success ? results : results[0];
  }
});

function generateTeamTournament({ drawSize = 8, valueGoal = 2 } = {}) {
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
  } = mocksEngine.generateTournamentRecord({ eventProfiles });

  return { tournamentRecord, eventId, drawId };
}
