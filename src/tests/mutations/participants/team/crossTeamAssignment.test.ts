import { generateTeamTournament } from './generateTestTeamTournament';
import tournamentEngine from '@Engines/syncEngine';
import { expect, test } from 'vitest';

import { INDIVIDUAL } from '@Constants/participantConstants';
import { SINGLES, TEAM } from '@Constants/matchUpTypes';

test.skip('participants can play for a team even when not part of team', () => {
  const scenario = {
    singlesCount: 3,
    doublesCount: 0,
    valueGoal: 2,
    drawSize: 4,
  };

  const { tournamentRecord, drawId, valueGoal } = generateTeamTournament(scenario);
  expect(valueGoal).toEqual(scenario.valueGoal);

  tournamentEngine.setState(tournamentRecord);

  const { matchUps: firstRoundDualMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM], roundNumbers: [1] },
  });

  const { participants: individualParticipants } = tournamentEngine.getParticipants({
    participantFilters: { participantTypes: [INDIVIDUAL] },
  });

  const { participants: teamParticipants } = tournamentEngine.getParticipants({
    participantFilters: { participantTypes: [TEAM] },
  });

  // get positionAssignments to determine drawPositions
  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { positionAssignments } = drawDefinition.structures[0];

  const participantIndex = 0;
  // for each first round dualMatchUp assign individualParticipants to singles matchUps
  firstRoundDualMatchUps.forEach((dualMatchUp) => {
    const singlesMatchUps = dualMatchUp.tieMatchUps.filter(({ matchUpType }) => matchUpType === SINGLES);
    singlesMatchUps.forEach((singlesMatchUp) => {
      const tieMatchUpId = singlesMatchUp.matchUpId;
      singlesMatchUp.sides.forEach((side) => {
        const { drawPosition } = side;
        const teamParticipant = teamParticipants.find((teamParticipant) => {
          const { participantId } = teamParticipant;
          const assignment = positionAssignments.find((assignment) => assignment.participantId === participantId);
          return assignment.drawPosition === drawPosition;
        });
        const individualParticipantId = individualParticipants[participantIndex].participantId;
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
