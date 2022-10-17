import { generateTeamTournament } from '../../../tournamentEngine/tests/team/generateTestTeamTournament';
import { scoreHasValue } from '../../../matchUpEngine/governors/queryGovernor/scoreHasValue';
import tournamentEngine from '../../../tournamentEngine/sync';

import { IN_PROGRESS } from '../../../constants/matchUpStatusConstants';
import { LINEUPS } from '../../../constants/extensionConstants';
import {
  PAIR,
  TEAM_PARTICIPANT,
} from '../../../constants/participantConstants';
import {
  DOUBLES_MATCHUP,
  SINGLES_MATCHUP,
} from '../../../constants/matchUpTypes';

const scenario = {
  drawSize: 16,
  singlesCount: 3,
  doublesCount: 2,
  valueGoal: 3,
};

it('can substitute an individual participant in a TEAM tieMatchUp', () => {
  const { tournamentRecord, drawId, valueGoal } =
    generateTeamTournament(scenario);
  expect(valueGoal).toEqual(scenario.valueGoal);

  tournamentEngine.setState(tournamentRecord);

  // get positionAssignments to determine drawPositions
  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { positionAssignments } = drawDefinition.structures[0];

  let lineUpExtension = drawDefinition.extensions.find(
    ({ name }) => name === LINEUPS
  );
  expect(lineUpExtension).toBeUndefined();

  let { tournamentParticipants: teamParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [TEAM_PARTICIPANT] },
    });

  const assignParticipants = (dualMatchUp) => {
    const singlesMatchUps = dualMatchUp.tieMatchUps.filter(
      ({ matchUpType }) => matchUpType === SINGLES_MATCHUP
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
      matchUpTypes: [TEAM_PARTICIPANT],
    },
  });

  // assign individual participants to all first round EAST matchUps
  teamMatchUps
    .filter(
      ({ stageSequence, roundNumber }) =>
        stageSequence === 1 && roundNumber === 1
    )
    .forEach(assignParticipants);

  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  lineUpExtension = drawDefinition.extensions.find(
    ({ name }) => name === LINEUPS
  );
  expect(lineUpExtension).not.toBeUndefined();

  let { tournamentParticipants: pairParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [PAIR] },
      withDraws: true,
    });

  expect(pairParticipants.length).toEqual(32);

  let participantIndex = 0;
  // for each first round dualMatchUp assign individualParticipants to doubles matchUps
  teamMatchUps
    .filter(({ roundNumber }) => roundNumber === 1)
    .forEach((dualMatchUp) => {
      const doublesMatchUps = dualMatchUp.tieMatchUps.filter(
        ({ matchUpType }) => matchUpType === DOUBLES_MATCHUP
      );
      doublesMatchUps.forEach((doublesMatchUp) => {
        const tieMatchUpId = doublesMatchUp.matchUpId;
        doublesMatchUp.sides.forEach((side) => {
          const { drawPosition } = side;
          const teamParticipant = teamParticipants.find((teamParticipant) => {
            const { participantId } = teamParticipant;
            const assignment = positionAssignments.find(
              (assignment) => assignment.participantId === participantId
            );
            return assignment.drawPosition === drawPosition;
          });

          const pairParticipantId =
            pairParticipants[participantIndex].participantId;

          const result = tournamentEngine.assignTieMatchUpParticipantId({
            teamParticipantId: teamParticipant.participantId,
            participantId: pairParticipantId,
            tieMatchUpId,
            drawId,
          });
          expect(result.success).toEqual(true);
          participantIndex += 1;
        });
      });
    });
  const { matchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { readyToScore: true },
  });

  const singlesMatchUps = matchUps.filter(
    ({ matchUpType }) => matchUpType === SINGLES_MATCHUP
  );
  expect(singlesMatchUps.length).toEqual(24);

  const singlesMatchUpId = singlesMatchUps[0].matchUpId;

  let outcome = {
    score: { sets: [{ side1Score: 5, side2Score: 2 }] },
  };

  result = tournamentEngine.matchUpActions({
    matchUpId: singlesMatchUpId,
    drawId,
  });
  let validActions = result.validActions.map(({ type }) => type);
  // options for singles matchUps don't change after scoring is active
  expect(validActions).toEqual(['REFEREE', 'SCHEDULE']);

  let result = tournamentEngine.setMatchUpStatus({
    matchUpId: singlesMatchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  let {
    matchUps: [matchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpIds: [singlesMatchUpId] },
  });
  expect(matchUp.matchUpStatus).toEqual(IN_PROGRESS);
  expect(scoreHasValue(matchUp)).toEqual(true);

  result = tournamentEngine.matchUpActions({
    matchUpId: singlesMatchUpId,
    drawId,
  });
  validActions = result.validActions.map(({ type }) => type);
  // options for singles matchUps don't change after scoring is active
  expect(validActions).toEqual(['REFEREE', 'SCHEDULE']);

  // test doublesMatchUps
  const doublesMatchUps = matchUps.filter(
    ({ matchUpType }) => matchUpType === DOUBLES_MATCHUP
  );
  expect(doublesMatchUps.length).toEqual(16);

  const doublesMatchUpId = doublesMatchUps[0].matchUpId;

  result = tournamentEngine.matchUpActions({
    matchUpId: doublesMatchUpId,
    drawId,
  });
  validActions = result.validActions.map(({ type }) => type);
  expect(validActions).toEqual(['REFEREE', 'SCHEDULE']);

  result = tournamentEngine.setMatchUpStatus({
    matchUpId: doublesMatchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.matchUpActions({
    matchUpId: doublesMatchUpId,
    drawId,
  });
  validActions = result.validActions.map(({ type }) => type);
  expect(validActions).toEqual(['REFEREE', 'SCHEDULE', 'SUBSTITUTION']);
});
