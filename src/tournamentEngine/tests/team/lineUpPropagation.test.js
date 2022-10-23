import { generateTeamTournament } from './generateTestTeamTournament';
import tournamentEngine from '../../sync';

import { COMPASS } from '../../../constants/drawDefinitionConstants';
import { TEAM } from '../../../constants/participantConstants';
import { SINGLES } from '../../../constants/matchUpTypes';

const scenario = {
  drawType: COMPASS,
  drawSize: 16,
  singlesCount: 3,
  valueGoal: 2,
};

it('can propagate and remove lineUps', () => {
  const { tournamentRecord, drawId, valueGoal } =
    generateTeamTournament(scenario);
  expect(valueGoal).toEqual(scenario.valueGoal);

  tournamentEngine.setState(tournamentRecord);

  // get positionAssignments to determine drawPositions
  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { positionAssignments } = drawDefinition.structures[0];

  let { tournamentParticipants: teamParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [TEAM] },
    });

  const assignParticipants = (dualMatchUp) => {
    const singlesMatchUps = dualMatchUp.tieMatchUps.filter(
      ({ matchUpType }) => matchUpType === SINGLES
    );
    singlesMatchUps.forEach((singlesMatchUp, i) => {
      const tieMatchUpId = singlesMatchUp.matchUpId;
      singlesMatchUp.sides.forEach((side) => {
        const { drawPosition } = side;
        const teamParticipant = teamParticipants.find((teamParticipant) => {
          const { participantId } = teamParticipant;
          const assignment = positionAssignments.find(
            (assignment) => assignment.participantId === participantId
          );
          return assignment.drawPosition === drawPosition;
        });
        if (teamParticipant) {
          const individualParticipantId =
            teamParticipant.individualParticipantIds[i];
          const result = tournamentEngine.assignTieMatchUpParticipantId({
            participantId: individualParticipantId,
            tieMatchUpId,
            drawId,
          });
          if (!result.success) console.log(result);
          expect(result.success).toEqual(true);
        }
      });
    });
  };

  let { matchUps: teamMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: {
      matchUpTypes: [TEAM],
    },
  });

  const winningSide = 1;
  const losingSide = 2;

  const losingParticipantIds = teamMatchUps
    .filter(({ readyToScore }) => readyToScore)
    .flatMap(
      ({ sides }) =>
        sides.find(({ sideNumber }) => sideNumber === losingSide)?.participantId
    );

  // assign individual participants to all first round EAST matchUps
  teamMatchUps
    .filter(
      ({ stageSequence, roundNumber }) =>
        stageSequence === 1 && roundNumber === 1
    )
    .forEach(assignParticipants);

  let outcome = {
    winningSide,
    score: { sets: [{ side1Score: 2, side2Score: 1, winningSide: 1 }] },
  };

  const { matchUps: singlesMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: {
      matchUpTypes: [SINGLES],
    },
  });

  // complete all first round EAST matchUps
  singlesMatchUps
    .filter(
      ({ stageSequence, roundNumber }) =>
        stageSequence === 1 && roundNumber === 1
    )
    .forEach(({ matchUpId }) => {
      let result = tournamentEngine.setMatchUpStatus({
        matchUpId,
        outcome,
        drawId,
      });
      expect(result.success).toEqual(true);
    });

  teamMatchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: {
      matchUpTypes: [TEAM],
    },
  }).matchUps;

  teamMatchUps
    .filter(
      ({ structureName, roundNumber }) =>
        structureName === 'WEST' && roundNumber === 1
    )
    .forEach(({ sides }) => {
      expect(losingParticipantIds.includes(sides[0].participantId)).toEqual(
        true
      );
      expect(losingParticipantIds.includes(sides[1].participantId)).toEqual(
        true
      );
      expect(sides[0].lineUp).toBeDefined();
      expect(sides[1].lineUp).toBeDefined();
      expect(sides[0].lineUp).not.toEqual(sides[1].lineUp);
    });

  outcome = {
    winningSide: undefined,
    score: { scoreStringSide1: '', scoreStringSide2: '', sets: undefined },
  };

  // clear all first round EAST matchUps
  singlesMatchUps
    .filter(
      ({ stageSequence, roundNumber }) =>
        stageSequence === 1 && roundNumber === 1
    )
    .forEach(({ matchUpId }) => {
      let result = tournamentEngine.setMatchUpStatus({
        matchUpId,
        outcome,
        drawId,
      });
      expect(result.success).toEqual(true);
    });

  teamMatchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: {
      matchUpTypes: [TEAM],
    },
  }).matchUps;

  teamMatchUps
    .filter(
      ({ structureName, roundNumber }) =>
        structureName === 'WEST' && roundNumber === 1
    )
    .forEach(({ sides }) => {
      expect(sides[0].lineUp).not.toBeDefined();
      expect(sides[1].lineUp).not.toBeDefined();
    });
});

it('can propagate COMPASS lineUps properly', () => {
  const { tournamentRecord, drawId, valueGoal } =
    generateTeamTournament(scenario);
  expect(valueGoal).toEqual(scenario.valueGoal);

  tournamentEngine.setState(tournamentRecord);

  // get positionAssignments to determine drawPositions
  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { positionAssignments } = drawDefinition.structures[0];

  let { tournamentParticipants: teamParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [TEAM] },
    });

  const assignParticipants = (dualMatchUp) => {
    const singlesMatchUps = dualMatchUp.tieMatchUps.filter(
      ({ matchUpType }) => matchUpType === SINGLES
    );
    singlesMatchUps.forEach((singlesMatchUp, i) => {
      const tieMatchUpId = singlesMatchUp.matchUpId;
      singlesMatchUp.sides.forEach((side) => {
        const { drawPosition } = side;
        const teamParticipant = teamParticipants.find((teamParticipant) => {
          const { participantId } = teamParticipant;
          const assignment = positionAssignments.find(
            (assignment) => assignment.participantId === participantId
          );
          return assignment.drawPosition === drawPosition;
        });
        if (teamParticipant) {
          const individualParticipantId =
            teamParticipant.individualParticipantIds[i];
          const result = tournamentEngine.assignTieMatchUpParticipantId({
            participantId: individualParticipantId,
            tieMatchUpId,
            drawId,
          });
          if (!result.success) console.log(result);
          expect(result.success).toEqual(true);
        }
      });
    });
  };

  let { matchUps: teamMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: {
      matchUpTypes: [TEAM],
    },
  });

  // assign individual participants to all first round EAST matchUps
  teamMatchUps
    .filter(
      ({ stageSequence, roundNumber }) =>
        stageSequence === 1 && roundNumber === 1
    )
    .forEach(assignParticipants);

  let outcome = {
    winningSide: 1,
    score: { sets: [{ side1Score: 2, side2Score: 1, winningSide: 1 }] },
  };

  const { matchUps: singlesMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: {
      matchUpTypes: [SINGLES],
    },
  });

  // complete all EAST matchUps
  singlesMatchUps
    .filter(({ stageSequence }) => stageSequence === 1)
    .forEach(({ matchUpId }) => {
      let result = tournamentEngine.setMatchUpStatus({
        matchUpId,
        outcome,
        drawId,
      });
      expect(result.success).toEqual(true);
    });

  teamMatchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: {
      matchUpTypes: [TEAM],
    },
  }).matchUps;

  teamMatchUps
    .filter(
      ({ stageSequence, roundNumber }) =>
        stageSequence === 2 && roundNumber === 1
    )
    .forEach(({ sides }) => {
      expect(sides[0].lineUp).not.toBeUndefined();
      expect(sides[1].lineUp).not.toBeUndefined();
      expect(sides[0].lineUp).not.toEqual(sides[1].lineUp);
    });
});
