import { generateTeamTournament } from './generateTestTeamTournament';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { TEAM_NOT_FOUND } from '../../../constants/errorConditionConstants';
import { DOUBLES, SINGLES, TEAM } from '../../../constants/matchUpTypes';
import { INDIVIDUAL } from '../../../constants/participantTypes';
import {
  COMPLETED,
  IN_PROGRESS,
} from '../../../constants/matchUpStatusConstants';

// reusable
const getMatchUp = (id, inContext) => {
  const {
    matchUps: [matchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpIds: [id] },
    inContext,
  });
  return matchUp;
};

const scenarios = [
  { drawSize: 2, singlesCount: 1, doublesCount: 0, valueGoal: 1 },
  { drawSize: 2, singlesCount: 0, doublesCount: 1, valueGoal: 1 },
  { drawSize: 2, singlesCount: 3, doublesCount: 0, valueGoal: 2 },
  { drawSize: 4, singlesCount: 3, doublesCount: 0, valueGoal: 2 },
  { drawSize: 8, singlesCount: 3, doublesCount: 0, valueGoal: 2 },
  { drawSize: 8, singlesCount: 6, doublesCount: 3, valueGoal: 5 },
];

it.each(scenarios)('can advance teamParticipants', (scenario) => {
  const { tournamentRecord, drawId, eventId, valueGoal } =
    generateTeamTournament(scenario);
  expect(valueGoal).toEqual(scenario.valueGoal);

  tournamentEngine.setState(tournamentRecord);

  let { matchUps: firstRoundDualMatchUps } =
    tournamentEngine.allTournamentMatchUps({
      matchUpFilters: { matchUpTypes: [TEAM], roundNumbers: [1] },
    });

  // get positionAssignments to determine drawPositions
  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { positionAssignments } = drawDefinition.structures[0];

  let { tournamentParticipants: teamParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [TEAM] },
    });

  // for each first round dualMatchUp assign individualParticipants to singles matchUps
  firstRoundDualMatchUps.forEach((dualMatchUp) => {
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
          expect(result.success).toEqual(true);
        }
      });
    });
  });

  // generate outcome to be applied to each first round singles matchUp
  const { outcome } = mocksEngine.generateOutcomeFromScoreString({
    matchUpStatus: COMPLETED,
    scoreString: '6-1 6-1',
    winningSide: 1,
  });

  // for all first round dualMatchUps complete all singles/doubles matchUps
  firstRoundDualMatchUps.forEach((dualMatchUp) => {
    const singlesMatchUps = dualMatchUp.tieMatchUps.filter(
      ({ matchUpType }) => matchUpType === SINGLES
    );
    singlesMatchUps.forEach((singlesMatchUp, i) => {
      const { matchUpId } = singlesMatchUp;
      let result = tournamentEngine.setMatchUpStatus({
        matchUpId,
        outcome,
        drawId,
      });
      expect(result.success).toEqual(true);
      const updatedDualMatchUp = getMatchUp(dualMatchUp.matchUpId);
      const { score, winningSide, matchUpStatus } = updatedDualMatchUp;
      expect(score.sets[0].side1Score).toEqual(i + 1);
      if (i + 1 >= valueGoal) {
        expect(winningSide).toEqual(1);
        expect(matchUpStatus).toEqual(COMPLETED);
      } else {
        expect(matchUpStatus).toEqual(IN_PROGRESS);
      }
    });

    const singlesMatchUpCount = singlesMatchUps.length;

    const doublesMatchUps = dualMatchUp.tieMatchUps.filter(
      ({ matchUpType }) => matchUpType === DOUBLES
    );
    doublesMatchUps.forEach((doublesMatchUp, i) => {
      const { matchUpId } = doublesMatchUp;
      let result = tournamentEngine.setMatchUpStatus({
        matchUpId,
        outcome,
        drawId,
      });
      expect(result.success).toEqual(true);
      const updatedDualMatchUp = getMatchUp(dualMatchUp.matchUpId);
      const { score, winningSide, matchUpStatus } = updatedDualMatchUp;
      expect(score.sets[0].side1Score).toEqual(singlesMatchUpCount + i + 1);
      if (singlesMatchUpCount + i + 1 >= valueGoal) {
        expect(winningSide).toEqual(1);
        expect(matchUpStatus).toEqual(COMPLETED);
      } else {
        expect(matchUpStatus).toEqual(IN_PROGRESS);
      }
    });
  });

  ({ matchUps: firstRoundDualMatchUps } =
    tournamentEngine.allTournamentMatchUps({
      matchUpFilters: { matchUpTypes: [TEAM], roundNumbers: [1] },
    }));

  firstRoundDualMatchUps.forEach((dualMatchUp) => {
    const { winningSide, matchUpStatus, score } = dualMatchUp;
    expect(matchUpStatus).toEqual(COMPLETED);
    expect(winningSide).toEqual(1);
    expect(score.sets[0].side1Score).toBeGreaterThanOrEqual(valueGoal);
  });

  let { matchUps: secondRoundDualMatchUps } =
    tournamentEngine.allTournamentMatchUps({
      matchUpFilters: { matchUpTypes: [TEAM], roundNumbers: [2] },
    });

  if (secondRoundDualMatchUps.length) {
    secondRoundDualMatchUps.forEach((dualMatchUp) => {
      expect(dualMatchUp.drawPositions.length).toEqual(2);
    });
  }

  const { eventData } = tournamentEngine.getEventData({ eventId });
  expect(eventData.drawsData.length).toEqual(1);
  eventData.drawsData[0].structures[0].roundMatchUps[1].forEach((matchUp) => {
    // expect only TEAM matchUps (SINGLES/DOUBLES matchUps are not included)
    expect(matchUp.tieMatchUps.length).toBeGreaterThan(0);
    expect(matchUp.matchUpType).toEqual(TEAM);

    // expect that each individual participant on the team also has team information
    matchUp.sides.forEach((side) =>
      side.participant.individualParticipants.forEach((individualParticipant) =>
        expect(individualParticipant.teams.length).toEqual(1)
      )
    );
  });
});

test('participants can play for a team even when not part of team', () => {
  const scenario = {
    drawSize: 4,
    singlesCount: 3,
    doublesCount: 0,
    valueGoal: 2,
  };

  const { tournamentRecord, drawId, valueGoal } =
    generateTeamTournament(scenario);
  expect(valueGoal).toEqual(scenario.valueGoal);

  tournamentEngine.setState(tournamentRecord);

  let { matchUps: firstRoundDualMatchUps } =
    tournamentEngine.allTournamentMatchUps({
      matchUpFilters: { matchUpTypes: [TEAM], roundNumbers: [1] },
    });

  let { tournamentParticipants: individualParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [INDIVIDUAL] },
    });

  let { tournamentParticipants: teamParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [TEAM] },
    });

  // get positionAssignments to determine drawPositions
  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { positionAssignments } = drawDefinition.structures[0];

  let participantIndex = 0;
  // for each first round dualMatchUp assign individualParticipants to singles matchUps
  firstRoundDualMatchUps.forEach((dualMatchUp) => {
    const singlesMatchUps = dualMatchUp.tieMatchUps.filter(
      ({ matchUpType }) => matchUpType === SINGLES
    );
    singlesMatchUps.forEach((singlesMatchUp) => {
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
        const individualParticipantId =
          individualParticipants[participantIndex].participantId;
        const result = tournamentEngine.assignTieMatchUpParticipantId({
          teamParticipantId: teamParticipant.participantId,
          participantId: individualParticipantId,
          tieMatchUpId,
          drawId,
        });
        expect(result.success).toEqual(true);
      });
    });
  });
});

test('participants for other teams cannot be assigned without teamParticipantId', () => {
  const scenario = {
    drawSize: 4,
    singlesCount: 3,
    doublesCount: 0,
    valueGoal: 2,
  };

  const { tournamentRecord, drawId, valueGoal } =
    generateTeamTournament(scenario);
  expect(valueGoal).toEqual(scenario.valueGoal);

  tournamentEngine.setState(tournamentRecord);

  let { matchUps: firstRoundDualMatchUps } =
    tournamentEngine.allTournamentMatchUps({
      matchUpFilters: { matchUpTypes: [TEAM], roundNumbers: [1] },
    });

  let { tournamentParticipants: individualParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [INDIVIDUAL] },
    });

  let errors = [];
  let participantIndex = 0;
  // for each first round dualMatchUp assign individualParticipants to singles matchUps
  firstRoundDualMatchUps.forEach((dualMatchUp) => {
    const singlesMatchUps = dualMatchUp.tieMatchUps.filter(
      ({ matchUpType }) => matchUpType === SINGLES
    );
    const success = singlesMatchUps.every((singlesMatchUp) => {
      const tieMatchUpId = singlesMatchUp.matchUpId;
      singlesMatchUp.sides.forEach(() => {
        const individualParticipantId =
          individualParticipants[participantIndex].participantId;
        const result = tournamentEngine.assignTieMatchUpParticipantId({
          participantId: individualParticipantId,
          tieMatchUpId,
          drawId,
        });
        if (result.error) errors.push(result.error);
        return result.success;
      });
    });
    expect(success).toEqual(false);
  });

  expect(errors.length).toBeGreaterThan(0);
  errors.forEach((error) => expect(error).toEqual(TEAM_NOT_FOUND));
});
