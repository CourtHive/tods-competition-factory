import { generateTeamTournament } from './generateTestTeamTournament';
import tournamentEngine from '../../sync';
import { expect, test } from 'vitest';

import { INDIVIDUAL } from '../../../constants/participantConstants';
import { SINGLES, TEAM } from '../../../constants/matchUpTypes';

test.skip('participants can play for a team even when not part of team', () => {
  const scenario = {
    singlesCount: 3,
    doublesCount: 0,
    valueGoal: 2,
    drawSize: 4,
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
