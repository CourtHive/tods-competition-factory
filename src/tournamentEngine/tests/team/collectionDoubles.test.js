import { getParticipantId } from '../../../global/functions/extractors';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { EXISTING_OUTCOME } from '../../../constants/errorConditionConstants';
import { TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';
import { DOUBLES, SINGLES, TEAM } from '../../../constants/matchUpTypes';
import { PAIR } from '../../../constants/participantTypes';

it('can both assign and remove individualParticipants in DOUBLES matchUps that are part of team events', () => {
  const { tournamentRecord, drawId } = generateTeamTournament({ drawSize: 2 });
  tournamentEngine.setState(tournamentRecord);

  // get the first doubles matchUp
  let {
    matchUps: [doublesMatchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [DOUBLES] },
  });

  // get the matchUpId for the first doubles matchUp
  let { matchUpId: doublesMatchUpId } = doublesMatchUp;

  // reusable
  const getDoublesMatchUp = (id, inContext) => {
    const {
      matchUps: [foo],
    } = tournamentEngine.allTournamentMatchUps({
      matchUpFilters: { matchUpIds: [id] },
      inContext,
    });
    return foo;
  };

  // confirm that matchUpFilters/matchUpIds can find tieMatchUps
  doublesMatchUp = getDoublesMatchUp(doublesMatchUpId);
  expect(doublesMatchUp.matchUpId).toEqual(doublesMatchUpId);
  expect(doublesMatchUp.matchUpType).toEqual(DOUBLES);

  // get positionAssignments to determine drawPositions
  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { positionAssignments } = drawDefinition.structures[0];

  // get the teamParticipantIds for each side in the matchUp
  const drawPositions = doublesMatchUp.drawPositions;
  const teamParticipantIds = positionAssignments
    .filter(({ drawPosition }) => drawPositions.includes(drawPosition))
    .map(getParticipantId);

  // get the teamParticipants for each side in the matchUp
  let { tournamentParticipants: teamParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantIds: teamParticipantIds },
    });

  const [firstParticipant, secondParticipant] = teamParticipants;
  const firstParticipantId = firstParticipant.participantId;
  const secondParticipantId = secondParticipant.participantId;

  const getSide = (id) => {
    const drawPosition = positionAssignments.find(
      (assignment) => assignment.participantId === id
    ).drawPosition;
    return doublesMatchUp.sides.find(
      (side) => side.drawPosition === drawPosition
    );
  };
  const firstParticipantSide = getSide(firstParticipantId);
  const secondParticipantSide = getSide(secondParticipantId);
  if (firstParticipantSide || secondParticipantSide) {
    //
  }

  // add the first sideMember for { sideNumber: 1 }
  let result = tournamentEngine.assignTieMatchUpParticipantId({
    participantId: firstParticipant.individualParticipantIds[0],
    sideNumber: firstParticipantSide.sideNumber,
    tieMatchUpId: doublesMatchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);
  expect(result.modifiedLineUp[0].collectionAssignments[0].sideMember).toEqual(
    1
  );
  expect(result.modifiedLineUp[0].participantId).toEqual(
    firstParticipant.individualParticipantIds[0]
  );
  expect(
    result.modifiedLineUp[0].collectionAssignments[0].collectionId
  ).toEqual(doublesMatchUp.collectionId);
  expect(
    result.modifiedLineUp[0].collectionAssignments[0].collectionPosition
  ).toEqual(doublesMatchUp.collectionPosition);

  doublesMatchUp = getDoublesMatchUp(doublesMatchUpId);
  const targetSide = doublesMatchUp.sides.find(
    (side) => side.sideNumber === firstParticipantSide.sideNumber
  );
  expect(targetSide.participant).not.toBeUndefined();

  doublesMatchUp = getDoublesMatchUp(doublesMatchUpId, false);
  expect(doublesMatchUp.sides).toEqual([{ SideNumber: 1 }, { SideNumber: 2 }]);

  // remove the first sideMember for { sideNumber: 1}
  result = tournamentEngine.assignTieMatchUpParticipantId({
    sideNumber: firstParticipantSide.sideNumber,
    tieMatchUpId: doublesMatchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);
  expect(result.modifiedLineUp[0].collectionAssignments.length).toEqual(0);
});

it('can both assign and remove individualParticipants in DOUBLES matchUps that are part of team events', () => {
  const { tournamentRecord, drawId } = generateTeamTournament();
  tournamentEngine.setState(tournamentRecord);

  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { positionAssignments } = drawDefinition.structures[0];

  let {
    matchUps: [doublesMatchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [DOUBLES] },
  });

  // reusable
  const getDoublesMatchUp = (id, inContext) => {
    const {
      matchUps: [foo],
    } = tournamentEngine.allTournamentMatchUps({
      matchUpFilters: { matchUpIds: [id] },
      inContext,
    });
    return foo;
  };

  let { drawPositions, matchUpId: doublesMatchUpId } = doublesMatchUp;
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
        tieMatchUpId: doublesMatchUpId,
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

      doublesMatchUp = getDoublesMatchUp(doublesMatchUpId);
      const matchUpSide = doublesMatchUp.sides.find(
        (side) => side.sideNumber === sideNumber
      );
      expect(matchUpSide.participant.participantType).toEqual(PAIR);
      expect(matchUpSide.participant.individualParticipantIds.length).toEqual(
        i + 1
      );
    });
  });

  let {
    matchUps: [teamMatchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpIds: [doublesMatchUp.matchUpTieId] },
    inContext: false,
  });
  teamMatchUp.sides.forEach((side) => {
    expect(side.lineUp[0].collectionAssignments.length).toEqual(1);
    expect(side.lineUp[1].collectionAssignments.length).toEqual(1);
  });

  // score the DOUBLES matchUp
  let { outcome } = mocksEngine.generateOutcome(doublesMatchUp);
  let result = tournamentEngine.setMatchUpStatus({
    matchUpId: doublesMatchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  doublesMatchUp = getDoublesMatchUp(doublesMatchUpId);
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
    matchUpId: doublesMatchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  // attempt to remove participants from DOUBLES matchUp; expect success
  result = removeDoublesParticipants({ sideMember: 1 });
  expect(result[0].success).toEqual(true);
  expect(result[1].success).toEqual(true);
  doublesMatchUp = getDoublesMatchUp(doublesMatchUpId);
  doublesMatchUp.sides.forEach((side) => {
    expect(side.participant.participantType).toEqual(PAIR);
    expect(side.participant.individualParticipantIds.length).toEqual(1);
  });

  let { tournamentParticipants: pairParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [PAIR] },
    });

  let individualParticipantIdsCount = pairParticipants
    .map(
      ({ individualParticipantIds }) => individualParticipantIds?.length || 0
    )
    .sort();
  expect(individualParticipantIdsCount).toEqual([1, 1, 2, 2, 2, 2, 2, 2]);

  result = removeDoublesParticipants({ sideMember: 2 });
  doublesMatchUp = getDoublesMatchUp(doublesMatchUpId);

  doublesMatchUp.sides.forEach((side) =>
    expect(side.participant).toBeUndefined()
  );

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

  ({ tournamentParticipants: pairParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [PAIR] },
    }));

  individualParticipantIdsCount = pairParticipants
    .map(
      ({ individualParticipantIds }) => individualParticipantIds?.length || 0
    )
    .sort();
  expect(individualParticipantIdsCount).toEqual([2, 2, 2, 2, 2, 2]);

  function removeDoublesParticipants({ sideMember = 1 } = {}) {
    const results = [];
    // remove individual participants from each DOUBLES matchUp
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
        tieMatchUpId: doublesMatchUpId,
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
