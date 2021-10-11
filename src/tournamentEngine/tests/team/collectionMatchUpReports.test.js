import { getParticipantId } from '../../../global/functions/extractors';
import { setDevContext } from '../../../global/globalState';
import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';

import { DOUBLES, SINGLES, TEAM } from '../../../constants/matchUpTypes';
import { INDIVIDUAL } from '../../../constants/participantTypes';

test('collection matchUps appear in participant reports', () => {
  const drawSize = 8;
  const { tournamentRecord, drawId } = generateTeamTournament({ drawSize });
  tournamentEngine.setState(tournamentRecord);

  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { positionAssignments } = drawDefinition.structures[0];

  const getTeamParticipants = (drawPositions) => {
    const teamParticipantIds = positionAssignments
      .filter(({ drawPosition }) => drawPositions.includes(drawPosition))
      .map(getParticipantId);

    const { tournamentParticipants: teamParticipants } =
      tournamentEngine.getTournamentParticipants({
        participantFilters: { participantIds: teamParticipantIds },
      });

    return teamParticipants;
  };

  let { matchUps: doublesMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [DOUBLES] },
  });

  // create collectionAssignments for all doublesMatchUps
  doublesMatchUps.forEach((doublesMatchUp) => {
    let { drawPositions, matchUpId: doublesMatchUpId } = doublesMatchUp;
    const teamParticipants = getTeamParticipants(drawPositions);
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

      individualParticipantIds.forEach((individualParticipantId, i) => {
        const result = tournamentEngine.assignTieMatchUpParticipantId({
          participantId: individualParticipantId,
          tieMatchUpId: doublesMatchUpId,
          sideNumber,
          drawId,
        });
        expect(result.success).toEqual(true);
        expect(result.modifiedLineUp.length).toEqual(i + 1);
      });
    });
  });

  ({ matchUps: doublesMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [DOUBLES] },
  }));

  doublesMatchUps.forEach(({ sides }) => {
    if (sides) {
      sides.forEach((side) => {
        if (side.participant) {
          expect(side.participant.individualParticipantIds.length).toEqual(2);
        }
      });
    }
  });

  let { matchUps: singlesMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [SINGLES] },
  });

  const teamSinglesCount = {};

  // create collectionAssignments for all singlesMatchUps
  singlesMatchUps.forEach((singlesMatchUp) => {
    let { drawPositions, matchUpId: doublesMatchUpId } = singlesMatchUp;
    const teamParticipants = getTeamParticipants(drawPositions);
    teamParticipants.forEach((teamParticipant) => {
      const { participantId } = teamParticipant;
      const assignment = positionAssignments.find(
        (assignment) => assignment.participantId === participantId
      );
      const side = singlesMatchUp.sides.find(
        (side) => side.drawPosition === assignment.drawPosition
      );
      const { sideNumber } = side;

      if (!teamSinglesCount[participantId]) teamSinglesCount[participantId] = 0;
      const count = teamSinglesCount[participantId];

      const individualParticipantId =
        teamParticipant.individualParticipantIds.slice(count, count + 1)[0];
      teamSinglesCount[participantId] += 1;

      const result = tournamentEngine.assignTieMatchUpParticipantId({
        participantId: individualParticipantId,
        tieMatchUpId: doublesMatchUpId,
        sideNumber,
        drawId,
      });
      expect(result.success).toEqual(true);
    });
  });

  singlesMatchUps.forEach(({ sides }) => {
    if (sides) {
      sides.forEach((side) => {
        if (side.participant) {
          expect(side.participant.individualParticipantIds.length).toEqual(1);
        }
      });
    }
  });

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    {
      participantFilters: { participantTypes: [INDIVIDUAL] },
      withGroupings: true,
      withMatchUps: true,
    }
  );
  expect(
    tournamentParticipants[0].draws[0].partnerParticipantIds.length
  ).toEqual(1);
  expect(
    tournamentParticipants[0].events[0].partnerParticipantIds.length
  ).toEqual(1);

  // check that the generated pairParticipant was used...
  // ...and that the intermediate pairParticipants (with one individualParticipantId), were deleted
  expect(tournamentParticipants[0].pairParticipantIds.length).toEqual(1);

  const { matchUps } = tournamentEngine.allTournamentMatchUps({
    tournamentRecord,
    matchUpFilters: { matchUpTypes: [DOUBLES] },
  });
  const placedParticipantIds = matchUps
    .map(({ sides }) => sides.map(({ participantId }) => participantId))
    .flat()
    .filter(Boolean);
  expect(placedParticipantIds.length).toEqual(drawSize);

  setDevContext({ ppp: true });
  const { tournamentParticipants: placedPairParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantIds: placedParticipantIds },
      withGroupings: true,
      withMatchUps: true,
    });

  expect(placedPairParticipants.length).toEqual(drawSize);

  // expect all DOUBLES pairParticipants to appear in both DOUBLES and TEAM matchUps
  placedPairParticipants.forEach((participant) =>
    expect(participant.matchUps.length).toEqual(2)
  );
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
