import { removeLineUpSubstitutions } from '../../../tournamentEngine/governors/eventGovernor/drawDefinitions/removeLineUpSubstitutions';
import { validateLineUp } from '../../../tournamentEngine/governors/eventGovernor/drawDefinitions/validateTeamLineUp';
import { generateTeamTournament } from '../../../tournamentEngine/tests/team/generateTestTeamTournament';
import { scoreHasValue } from '../../../matchUpEngine/governors/queryGovernor/scoreHasValue';
import tournamentEngine from '../../../tournamentEngine/sync';
import { intersection } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';

import { POLICY_TYPE_MATCHUP_ACTIONS } from '../../../constants/policyConstants';
import { IN_PROGRESS } from '../../../constants/matchUpStatusConstants';
import { LINEUPS } from '../../../constants/extensionConstants';
import {
  INVALID_MATCHUP,
  INVALID_PARTICIPANT_ID,
  INVALID_VALUES,
  MATCHUP_NOT_FOUND,
  MISSING_PARTICIPANT_ID,
} from '../../../constants/errorConditionConstants';
import {
  PAIR,
  TEAM_PARTICIPANT,
} from '../../../constants/participantConstants';
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
import {
  DOUBLES_MATCHUP,
  SINGLES_MATCHUP,
} from '../../../constants/matchUpTypes';

const scenario = {
  singlesCount: 3,
  doublesCount: 2,
  drawSize: 16,
  valueGoal: 3,
};

function assignIndividualParticipants({
  teamParticipants,
  doublesMatchUpCount,
  singlesMatchUpCount,
  teamMatchUpCount,
  drawDefinition,
  teamMatchUps,
}) {
  const { positionAssignments } = drawDefinition.structures[0];
  const { drawId } = drawDefinition;

  const assignSinglesParticipants = (singlesMatchUp, i) => {
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
  };

  const assignDoublesParticipants = (doublesMatchUp, i) => {
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
      if (teamParticipant) {
        const individualParticipantIds =
          teamParticipant.individualParticipantIds.slice(i * 2, i * 2 + 2);
        individualParticipantIds.forEach((individualParticipantId) => {
          const result = tournamentEngine.assignTieMatchUpParticipantId({
            participantId: individualParticipantId,
            tieMatchUpId,
            drawId,
          });
          if (!result.success) console.log(result);
          expect(result.success).toEqual(true);
        });
      }
    });
  };

  const assignParticipants = (dualMatchUp) => {
    // assign team participants to singlesG matchUps
    const singlesMatchUps = dualMatchUp.tieMatchUps.filter(
      ({ matchUpType }) => matchUpType === SINGLES_MATCHUP
    );
    singlesMatchUps
      .slice(0, singlesMatchUpCount)
      .forEach(assignSinglesParticipants);

    // assign team participants to doubles matchUps
    const doublesMatchUps = dualMatchUp.tieMatchUps.filter(
      ({ matchUpType }) => matchUpType === DOUBLES_MATCHUP
    );
    doublesMatchUps
      .slice(0, doublesMatchUpCount)
      .forEach(assignDoublesParticipants);
  };

  // assign individual participants to all first round EAST matchUps
  teamMatchUps
    .filter(
      ({ stageSequence, roundNumber }) =>
        stageSequence === 1 && roundNumber === 1
    )
    .slice(0, teamMatchUpCount)
    .forEach(assignParticipants);
}

it('can substitute an individual participant in a TEAM tieMatchUp', () => {
  const { tournamentRecord, drawId, valueGoal } =
    generateTeamTournament(scenario);
  expect(valueGoal).toEqual(scenario.valueGoal);

  tournamentEngine.setState(tournamentRecord);

  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  let lineUpExtension = drawDefinition.extensions.find(
    ({ name }) => name === LINEUPS
  );
  expect(lineUpExtension).toBeUndefined();

  let { tournamentParticipants: teamParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [TEAM_PARTICIPANT] },
    });

  let { matchUps: teamMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: {
      matchUpTypes: [TEAM_PARTICIPANT],
    },
  });

  assignIndividualParticipants({
    teamParticipants,
    drawDefinition,
    teamMatchUps,
  });

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

  let result = tournamentEngine.matchUpActions({
    matchUpId: singlesMatchUpId,
    drawId,
  });
  let validActions = result.validActions.map(({ type }) => type);
  expect(validActions).toEqual([
    REFEREE,
    SCHEDULE,
    PENALTY,
    STATUS,
    SCORE,
    START,
    END,
    REMOVE_PARTICIPANT,
    REPLACE_PARTICIPANT,
  ]);

  result = tournamentEngine.setMatchUpStatus({
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
  expect(validActions).toEqual([
    REFEREE,
    SCHEDULE,
    PENALTY,
    STATUS,
    SCORE,
    START,
    END,
    REMOVE_PARTICIPANT,
    REPLACE_PARTICIPANT,
    SUBSTITUTION,
  ]);

  // test doublesMatchUps
  let doublesMatchUps = matchUps.filter(
    ({ matchUpType }) => matchUpType === DOUBLES_MATCHUP
  );
  expect(doublesMatchUps.length).toEqual(16);

  const doublesMatchUpId = doublesMatchUps[0].matchUpId;
  const originalSides = doublesMatchUps[0].sides;

  result = tournamentEngine.matchUpActions({
    matchUpId: doublesMatchUpId,
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
    REPLACE_PARTICIPANT,
  ]);

  result = tournamentEngine.matchUpActions({
    policyDefinitions: {
      [POLICY_TYPE_MATCHUP_ACTIONS]: {
        substituteWithoutScore: true,
      },
    },
    matchUpId: doublesMatchUpId,
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
    REPLACE_PARTICIPANT,
    SUBSTITUTION,
  ]);

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

  expect(validActions).toEqual([
    REFEREE,
    SCHEDULE,
    PENALTY,
    STATUS,
    SCORE,
    START,
    END,
    REMOVE_PARTICIPANT,
    REPLACE_PARTICIPANT,
    SUBSTITUTION,
  ]);

  let substitutionAction = result.validActions.find(
    ({ type }) => type === SUBSTITUTION
  );

  expect(substitutionAction.existingParticipants.length).toEqual(4);
  expect(substitutionAction.availableParticipants.length).toEqual(2);
  // when no sideNumber is provided availableParticiants is an array
  expect(substitutionAction.availableParticipants[0].sideNumber).toEqual(1);
  expect(
    substitutionAction.availableParticipants[0].participants.length
  ).toEqual(2);

  result = tournamentEngine.matchUpActions({
    matchUpId: doublesMatchUpId,
    sideNumber: 3,
    drawId,
  });
  expect(result.error).toEqual(INVALID_VALUES);

  const targetSideNumber = 2;
  result = tournamentEngine.matchUpActions({
    sideNumber: targetSideNumber,
    matchUpId: doublesMatchUpId,
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
    REPLACE_PARTICIPANT,
    SUBSTITUTION,
  ]);

  substitutionAction = result.validActions.find(
    ({ type }) => type === SUBSTITUTION
  );

  expect(substitutionAction.existingParticipants.length).toEqual(2);
  expect(substitutionAction.availableParticipants.length).toEqual(2);

  const { method, payload, availableParticipantIds, existingParticipantIds } =
    substitutionAction;

  const substituteParticipantId = availableParticipantIds[0];
  Object.assign(payload, { substituteParticipantId });

  // method is 'substituteParticipant'
  result = tournamentEngine[method](payload);
  expect(result.error).toEqual(MISSING_PARTICIPANT_ID);

  const existingParticipantId = existingParticipantIds[0];
  Object.assign(payload, { existingParticipantId });

  result = tournamentEngine[method]({
    ...payload, // order is important!
    matchUpId: 'bogusMatchUpid',
  });
  expect(result.error).toEqual(MATCHUP_NOT_FOUND);

  result = tournamentEngine[method]({
    ...payload, // order is important!
    matchUpId: teamMatchUps[0].matchUpId,
  });
  expect(result.error).toEqual(INVALID_MATCHUP);

  result = tournamentEngine[method]({
    ...payload, // order is important!
    existingParticipantId: substituteParticipantId,
  });
  expect(result.error).toEqual(INVALID_PARTICIPANT_ID);

  result = tournamentEngine[method]({
    ...payload, // order is important!
    substituteParticipantId: existingParticipantId,
  });
  expect(result.error).toEqual(INVALID_PARTICIPANT_ID);

  result = tournamentEngine[method]({
    ...payload, // order is important!
    sideNumber: 1, // specifying a sideNumber which does not correspond to the side of the participants
  });
  expect(result.error).toEqual(INVALID_PARTICIPANT_ID);

  result = tournamentEngine[method](payload);
  expect(result.success).toEqual(true);

  const allMatchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  const targetMatchUp = allMatchUps.find(
    ({ matchUpId }) => matchUpId === doublesMatchUpId
  );

  const modifiedSides = targetMatchUp.sides;

  // expect the side that DID NOT have a substitution to be equivalent
  expect(
    originalSides.find(({ sideNumber }) => sideNumber !== targetSideNumber)
      .participantId
  ).toEqual(
    modifiedSides.find(({ sideNumber }) => sideNumber !== targetSideNumber)
      .participantId
  );

  // expect the side that DID have a substitution to be different
  expect(
    originalSides.find(({ sideNumber }) => sideNumber === targetSideNumber)
      .participantId
  ).not.toEqual(
    modifiedSides.find(({ sideNumber }) => sideNumber === targetSideNumber)
      .participantId
  );

  // expect the side that DID have a substitution to have one individualParticipantId that is equivalent const originalSideIndividualParticipantIds = originalSides.find(
  const originalSideIndividualParticipantIds = originalSides.find(
    ({ sideNumber }) => sideNumber === targetSideNumber
  ).participant.individualParticipantIds;
  const modifiedSideIndividualParticipantIds = modifiedSides.find(
    ({ sideNumber }) => sideNumber === targetSideNumber
  ).participant.individualParticipantIds;

  expect(
    intersection(
      originalSideIndividualParticipantIds,
      modifiedSideIndividualParticipantIds
    ).length
  ).toEqual(1);

  expect(
    modifiedSideIndividualParticipantIds.includes(substituteParticipantId)
  ).toEqual(true);

  const teamLineUps = allMatchUps
    .find(({ matchUpId }) => matchUpId === targetMatchUp.matchUpTieId)
    .sides.map(({ lineUp }) => lineUp);
  expect(
    teamLineUps.every((lineUp) => validateLineUp({ lineUp }).valid)
  ).toEqual(true);

  const modifiedLineUp = teamLineUps.find((lineUp) =>
    lineUp.some(({ collectionAssignments }) =>
      collectionAssignments.some(({ substitutionOrder }) => substitutionOrder)
    )
  );
  const prunedLineUp = removeLineUpSubstitutions({
    lineUp: modifiedLineUp,
    log: true,
  });
  // expect the number of participants in the lineUp to be the same
  expect(modifiedLineUp.length).toEqual(prunedLineUp.length);
  // expect the aggregate number of collectionAssignments in prunedLineUp to be one less
  expect(
    modifiedLineUp.flatMap((assignment) => assignment.collectionAssignments)
      .length
  ).toEqual(
    prunedLineUp.flatMap((assignment) => assignment.collectionAssignments)
      .length + 1
  );

  // expect there to be SOME collectionAssignments with substitutionOrder in prunedLineUp
  expect(
    modifiedLineUp
      .flatMap((assignment) => assignment.collectionAssignments)
      .some(({ substitutionOrder }) => substitutionOrder)
  ).toEqual(true);
  // expect there to be NO collectionAssignments with substitutionOrder in prunedLineUp
  expect(
    prunedLineUp
      .flatMap((assignment) => assignment.collectionAssignments)
      .some(({ substitutionOrder }) => substitutionOrder)
  ).toEqual(false);

  result = mocksEngine.generateOutcomeFromScoreString({
    scoreString: '7-5 7-5',
    winningSide: 1,
  });
  outcome = result.outcome;

  result = tournamentEngine.setMatchUpStatus({
    matchUpId: doublesMatchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.matchUpActions({
    sideNumber: targetSideNumber,
    matchUpId: doublesMatchUpId,
    drawId,
  });
  validActions = result.validActions.map(({ type }) => type);

  expect(validActions).toEqual([
    REFEREE,
    PENALTY,
    SCORE,
    START,
    END,
    REMOVE_PARTICIPANT,
    REPLACE_PARTICIPANT,
  ]);

  result = tournamentEngine.matchUpActions({
    policyDefinitions: {
      [POLICY_TYPE_MATCHUP_ACTIONS]: {
        substituteAfterCompleted: true,
      },
    },
    sideNumber: targetSideNumber,
    matchUpId: doublesMatchUpId,
    drawId,
  });
  validActions = result.validActions.map(({ type }) => type);

  expect(validActions).toEqual([
    REFEREE,
    PENALTY,
    SCORE,
    START,
    END,
    REMOVE_PARTICIPANT,
    REPLACE_PARTICIPANT,
    SUBSTITUTION,
  ]);
});

function makeSubstitution({ drawId, matchUpType, matchUp, sideNumber = 1 }) {
  const matchUps =
    !matchUp &&
    tournamentEngine.allTournamentMatchUps({
      matchUpFilters: { matchUpTypes: [matchUpType] },
    }).matchUps;

  let targetMatchUp =
    matchUp || matchUps.find((s) => s.sides?.[0]?.participant);

  let result = tournamentEngine.matchUpActions({
    policyDefinitions: {
      [POLICY_TYPE_MATCHUP_ACTIONS]: {
        substituteWithoutScore: true,
      },
    },
    matchUpId: targetMatchUp.matchUpId,
    sideNumber,
    drawId,
  });
  const substitutionAction = result.validActions.find(
    ({ type }) => type === SUBSTITUTION
  );

  const { method, payload, availableParticipantIds, existingParticipantIds } =
    substitutionAction;

  const substituteParticipantId = availableParticipantIds[0];
  const existingParticipantId = existingParticipantIds[0];

  Object.assign(payload, { substituteParticipantId, existingParticipantId });

  // method is 'substituteParticipant'
  result = tournamentEngine[method](payload);
  result.matchUpId = payload.matchUpId;

  return result;
}

it('can substitute a single individual participant in a TEAM tieMatchUp when only one position has been assigned', () => {
  const { tournamentRecord, drawId, valueGoal } =
    generateTeamTournament(scenario);
  expect(valueGoal).toEqual(scenario.valueGoal);

  tournamentEngine.setState(tournamentRecord);

  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  let lineUpExtension = drawDefinition.extensions.find(
    ({ name }) => name === LINEUPS
  );
  expect(lineUpExtension).toBeUndefined();

  const { tournamentParticipants: teamParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [TEAM_PARTICIPANT] },
    });

  const { matchUps: teamMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: {
      matchUpTypes: [TEAM_PARTICIPANT],
    },
  });

  assignIndividualParticipants({
    doublesMatchUpCount: 0,
    singlesMatchUpCount: 1,
    teamMatchUpCount: 1,
    teamParticipants,
    drawDefinition,
    teamMatchUps,
  });

  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  lineUpExtension = drawDefinition.extensions.find(
    ({ name }) => name === LINEUPS
  );
  expect(lineUpExtension).not.toBeUndefined();

  const result = makeSubstitution({ drawId, matchUpType: SINGLES_MATCHUP });
  const tieMatchUp = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: {
      matchUpIds: [result.matchUpId],
    },
  }).matchUps[0];

  expect(tieMatchUp.processCodes).toEqual(['RANKING.IGNORE']);

  const side = tieMatchUp.sides.find(({ sideNumber }) => sideNumber === 1);
  console.log(side.substitutions);

  const sOrder = result.modifiedLineUp.map((participant) => {
    return participant.collectionAssignments.find(
      (assignment) => assignment.substitutionOrder !== undefined
    )?.substitutionOrder;
  });
  expect(sOrder).toEqual([0, 1]);
});
