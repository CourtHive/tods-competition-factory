import { validateLineUp } from '../../../tournamentEngine/governors/eventGovernor/drawDefinitions/validateTeamLineUp';
import { generateTeamTournament } from '../../../tournamentEngine/tests/team/generateTestTeamTournament';
import tournamentEngine from '../../../tournamentEngine/sync';
import { expect, it } from 'vitest';

import { ASSIGN_PARTICIPANT } from '../../../constants/positionActionConstants';
import { SINGLES_MATCHUP } from '../../../constants/matchUpTypes';
import { LINEUPS } from '../../../constants/extensionConstants';
import {
  END,
  PENALTY,
  REFEREE,
  REMOVE_PARTICIPANT,
  REPLACE_PARTICIPANT,
  SCHEDULE,
  SCORE,
  START,
  STATUS,
  SUBSTITUTION,
} from '../../../constants/matchUpActionConstants';

const scenario = {
  singlesCount: 3,
  doublesCount: 2,
  drawSize: 16,
  valueGoal: 3,
};

it('can substitute an individual participant in a TEAM tieMatchUp', () => {
  const { tournamentRecord, drawId, valueGoal } =
    generateTeamTournament(scenario);
  expect(valueGoal).toEqual(scenario.valueGoal);

  tournamentEngine.setState(tournamentRecord);

  // get positionAssignments to determine drawPositions
  let { drawDefinition } = tournamentEngine.getEvent({ drawId });

  let lineUpExtension = drawDefinition.extensions.find(
    ({ name }) => name === LINEUPS
  );
  expect(lineUpExtension).toBeUndefined();

  let { matchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { roundNumbers: [1] },
  });

  const singlesMatchUps = matchUps.filter(
    ({ matchUpType }) => matchUpType === SINGLES_MATCHUP
  );

  expect(singlesMatchUps.length).toEqual(24);

  let teamLineUps = matchUps
    .find(({ matchUpId }) => matchUpId === singlesMatchUps[0].matchUpTieId)
    .sides.map(({ lineUp }) => lineUp)
    .filter(Boolean);
  expect(teamLineUps.length).toEqual(0);

  const singlesMatchUpId = singlesMatchUps[0].matchUpId;

  let result = tournamentEngine.matchUpActions({
    matchUpId: singlesMatchUpId,
    sideNumber: 1,
    drawId,
  });
  let validActions = result.validActions.map(({ type }) => type);

  expect(validActions).toEqual([REFEREE, SCHEDULE, ASSIGN_PARTICIPANT]);

  let assignPositionAction = result.validActions.find(
    ({ type }) => type === ASSIGN_PARTICIPANT
  );
  let { method, payload, availableParticipantIds } = assignPositionAction;
  let participantId = availableParticipantIds[0];

  result = tournamentEngine[method]({ ...payload, participantId });
  expect(result.success).toEqual(true);

  matchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { roundNumbers: [1] },
  }).matchUps;

  // lineUps are created as individual participants are assigned
  teamLineUps = matchUps
    .find(({ matchUpId }) => matchUpId === singlesMatchUps[0].matchUpTieId)
    .sides.map(({ lineUp }) => lineUp)
    .filter(Boolean);
  expect(teamLineUps.length).toEqual(1);

  expect(
    teamLineUps.every((lineUp) => validateLineUp({ lineUp }).valid)
  ).toEqual(true);

  result = tournamentEngine.matchUpActions({
    matchUpId: singlesMatchUpId,
    sideNumber: 1,
    drawId,
  });
  validActions = result.validActions.map(({ type }) => type);
  expect(validActions).toEqual([
    REFEREE,
    SCHEDULE,
    PENALTY,
    REMOVE_PARTICIPANT,
    REPLACE_PARTICIPANT,
  ]);

  result = tournamentEngine.matchUpActions({
    matchUpId: singlesMatchUpId,
    sideNumber: 2,
    drawId,
  });
  validActions = result.validActions.map(({ type }) => type);
  expect(validActions).toEqual([REFEREE, SCHEDULE, ASSIGN_PARTICIPANT]);

  assignPositionAction = result.validActions.find(
    ({ type }) => type === ASSIGN_PARTICIPANT
  );
  ({ method, payload, availableParticipantIds } = assignPositionAction);
  participantId = availableParticipantIds[0];

  result = tournamentEngine[method]({ ...payload, participantId });
  expect(result.success).toEqual(true);

  result = tournamentEngine.matchUpActions({
    matchUpId: singlesMatchUpId,
    drawId,
  });
  validActions = result.validActions.map(({ type }) => type);
  expect(validActions).toEqual([
    REFEREE,
    SCHEDULE,
    PENALTY,
    STATUS,
    SCORE,
    START,
    END,
    REMOVE_PARTICIPANT,
  ]);

  // add an incomplete outcome and confirm SUBSTITUTION for SINGLES_MATCHUP
  let outcome = {
    score: { sets: [{ side1Score: 5, side2Score: 2 }] },
  };

  result = tournamentEngine.setMatchUpStatus({
    matchUpId: singlesMatchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.matchUpActions({
    matchUpId: singlesMatchUpId,
    drawId,
  });
  validActions = result.validActions.map(({ type }) => type);
  expect(validActions).toEqual([
    REFEREE,
    SCHEDULE,
    PENALTY,
    STATUS,
    SCORE,
    START,
    END,
    SUBSTITUTION,
  ]);
});
