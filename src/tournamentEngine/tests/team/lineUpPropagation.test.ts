import { findExtension } from '../../governors/queryGovernor/extensionQueries';
import { generateTeamTournament } from './generateTestTeamTournament';
import { setSubscriptions } from '../../../global/state/globalState';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import { MODIFY_DRAW_DEFINITION } from '../../../constants/topicConstants';
import { LINEUPS } from '../../../constants/extensionConstants';
import { TEAM } from '../../../constants/participantConstants';
import { SINGLES } from '../../../constants/matchUpTypes';
import { extractAttributes } from '../../../utilities';
import {
  COMPASS,
  ROUND_ROBIN,
} from '../../../constants/drawDefinitionConstants';

const scenario = {
  drawType: COMPASS,
  singlesCount: 3,
  valueGoal: 2,
  drawSize: 16,
};

it('can propagate and remove lineUps', () => {
  const { tournamentRecord, drawId, valueGoal } =
    generateTeamTournament(scenario);
  expect(valueGoal).toEqual(scenario.valueGoal);

  tournamentEngine.setState(tournamentRecord);

  let { matchUps: teamMatchUps } = tournamentEngine
    .devContext(false)
    .allTournamentMatchUps({
      matchUpFilters: { matchUpTypes: [TEAM] },
    });

  const winningSide = 1;
  const losingSide = 2;

  const losingParticipantIds = teamMatchUps
    .filter(({ readyToScore }) => readyToScore)
    .flatMap(
      ({ sides }) =>
        sides.find(({ sideNumber }) => sideNumber === losingSide)?.participantId
    );
  const winningParticipantIds = teamMatchUps
    .filter(({ readyToScore }) => readyToScore)
    .flatMap(
      ({ sides }) =>
        sides.find(({ sideNumber }) => sideNumber === winningSide)
          ?.participantId
    );

  // assign individual participants to all first round East matchUps
  teamMatchUps
    .filter(
      ({ stageSequence, roundNumber }) =>
        stageSequence === 1 && roundNumber === 1
    )
    .forEach((dualMatchUp) => assignParticipants({ dualMatchUp }));

  const scoringOutcome: any = {
    score: { sets: [{ side1Score: 2, side2Score: 1, winningSide: 1 }] },
    winningSide,
  };
  const clearingOutcome = {
    score: { scoreStringSide1: '', scoreStringSide2: '', sets: undefined },
    winningSide: undefined,
  };

  const { matchUps: singlesMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [SINGLES] },
  });

  const scoreSinglesMatchUps = (outcome) => {
    singlesMatchUps
      .filter(
        ({ stageSequence, roundNumber }) =>
          stageSequence === 1 && roundNumber === 1
      )
      .forEach(({ matchUpId }) => {
        const result = tournamentEngine.setMatchUpStatus({
          matchUpId,
          outcome,
          drawId,
        });
        expect(result.success).toEqual(true);
      });
  };

  // complete all first round East matchUps
  scoreSinglesMatchUps(scoringOutcome);

  teamMatchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
  }).matchUps;

  teamMatchUps
    .filter(
      ({ structureName, roundNumber }) =>
        structureName === 'West' && roundNumber === 1
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

  // clear all first round East matchUps
  scoreSinglesMatchUps(clearingOutcome);

  teamMatchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
  }).matchUps;

  teamMatchUps
    .filter(
      ({ structureName, roundNumber }) =>
        structureName === 'West' && roundNumber === 1
    )
    .forEach(({ sides }) => {
      expect(sides[0].lineUp).not.toBeDefined();
      expect(sides[1].lineUp).not.toBeDefined();
    });

  let noContextTeamMatchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
    inContext: false,
  }).matchUps;

  const matchUpsWithLineUps = noContextTeamMatchUps.filter(
    ({ sides }) => sides?.some((side) => side.lineUp)
  );
  // only first round East matchUps with scoreValue should have lineUp attached
  expect(matchUpsWithLineUps.length).toEqual(8);
  for (const noContextMatchUp of matchUpsWithLineUps) {
    expect(noContextMatchUp.roundNumber).toEqual(1);
  }

  // re-complete all first round East matchUps
  scoreSinglesMatchUps(scoringOutcome);

  const getAssignmentsCount = (drawDefinition) =>
    Object.values(
      drawDefinition.extensions.find(({ name }) => name === 'lineUps')?.value ??
        {}
    ).flat().length;

  let drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;

  const lineUpAssignmentsCounts = [getAssignmentsCount(drawDefinition)];
  let drawModifications = 0;
  setSubscriptions({
    subscriptions: {
      [MODIFY_DRAW_DEFINITION]: ([{ drawDefinition }]) => {
        drawModifications += 1;
        lineUpAssignmentsCounts.push(getAssignmentsCount(drawDefinition));
      },
    },
  });

  teamMatchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
  }).matchUps;

  let eastRound2MatchUps = teamMatchUps.filter(
    ({ structureName, roundNumber }) =>
      structureName === 'East' && roundNumber === 2
  );

  // teams which have advanced to East roundNumber: 2
  eastRound2MatchUps.forEach(({ matchUpId, sides }) => {
    expect(winningParticipantIds.includes(sides[0].participantId)).toEqual(
      true
    );
    expect(winningParticipantIds.includes(sides[1].participantId)).toEqual(
      true
    );
    expect(sides[0].lineUp).toBeDefined();
    expect(sides[1].lineUp).toBeDefined();
    expect(sides[0].lineUp).not.toEqual(sides[1].lineUp);

    const resetResult = tournamentEngine.resetMatchUpLineUps({
      inheritance: false,
      matchUpId,
      drawId,
    });
    expect(resetResult.success).toEqual(true);
  });

  expect(drawModifications).toEqual(eastRound2MatchUps.length);
  expect(lineUpAssignmentsCounts).toEqual([48, 42, 36, 30, 24]);

  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  expect(getAssignmentsCount(drawDefinition)).toEqual(24);

  for (const participantId of winningParticipantIds) {
    const { lineUp } = tournamentEngine.getTeamLineUp({
      participantId,
      drawId,
    });
    expect(lineUp).toEqual([]);
  }

  teamMatchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
  }).matchUps;

  eastRound2MatchUps = teamMatchUps.filter(
    ({ structureName, roundNumber }) =>
      structureName === 'East' && roundNumber === 2
  );

  eastRound2MatchUps.forEach(({ sides }) => {
    expect(winningParticipantIds.includes(sides[0].participantId)).toEqual(
      true
    );
    expect(winningParticipantIds.includes(sides[1].participantId)).toEqual(
      true
    );

    expect(sides[0].lineUp).not.toBeDefined();
    expect(sides[1].lineUp).not.toBeDefined();
  });

  let westRound1MatchUps = teamMatchUps.filter(
    ({ structureName, roundNumber }) =>
      structureName === 'West' && roundNumber === 1
  );

  westRound1MatchUps.forEach(({ sides }) => {
    expect(sides[0].lineUp).toBeDefined();
    expect(sides[1].lineUp).toBeDefined();
  });

  const westRound1MatchUpIds = westRound1MatchUps.map(
    extractAttributes('matchUpId')
  );

  noContextTeamMatchUps = tournamentEngine
    .devContext(true)
    .allTournamentMatchUps({
      matchUpFilters: { matchUpTypes: [TEAM] },
      inContext: false,
    }).matchUps;

  westRound1MatchUps = noContextTeamMatchUps.filter(({ matchUpId }) =>
    westRound1MatchUpIds.includes(matchUpId)
  );

  // in this case { inheritance: true } causes lineUps to be removed from no context matchUps
  // but inherited lineUps are retained
  westRound1MatchUps.forEach(({ matchUpId, sides }) => {
    expect(sides[0].lineUp).toBeDefined();
    expect(sides[1].lineUp).toBeDefined();

    const resetResult = tournamentEngine.resetMatchUpLineUps({
      inheritance: true,
      matchUpId,
      drawId,
    });
    expect(resetResult.success).toEqual(true);
  });

  noContextTeamMatchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
    inContext: false,
  }).matchUps;

  westRound1MatchUps = noContextTeamMatchUps.filter(({ matchUpId }) =>
    westRound1MatchUpIds.includes(matchUpId)
  );

  westRound1MatchUps.forEach(({ sides }) => {
    expect(sides[0].lineUp).not.toBeDefined();
    expect(sides[1].lineUp).not.toBeDefined();
  });
});

it('can propagate COMPASS lineUps properly', () => {
  const { tournamentRecord, drawId, valueGoal } =
    generateTeamTournament(scenario);
  expect(valueGoal).toEqual(scenario.valueGoal);

  tournamentEngine.setState(tournamentRecord);

  let { matchUps: teamMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: {
      matchUpTypes: [TEAM],
    },
  });

  // assign individual participants to all first round East matchUps
  teamMatchUps
    .filter(
      ({ stageSequence, roundNumber }) =>
        stageSequence === 1 && roundNumber === 1
    )
    .forEach((dualMatchUp) => assignParticipants({ dualMatchUp }));

  const outcome = {
    score: { sets: [{ side1Score: 2, side2Score: 1, winningSide: 1 }] },
    winningSide: 1,
  };

  const { matchUps: singlesMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: {
      matchUpTypes: [SINGLES],
    },
  });

  // complete all East matchUps
  singlesMatchUps
    .filter(({ stageSequence }) => stageSequence === 1)
    .forEach(({ matchUpId }) => {
      const result = tournamentEngine.setMatchUpStatus({
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

it('will attach lineUps on score entry', () => {
  const scenario = {
    drawType: ROUND_ROBIN,
    valueGoal: 2,
    drawSize: 4,
  };
  const { tournamentRecord, drawId, valueGoal } =
    generateTeamTournament(scenario);
  expect(valueGoal).toEqual(scenario.valueGoal);

  tournamentEngine.setState(tournamentRecord);

  let drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  let lineUps = findExtension({ element: drawDefinition, name: LINEUPS })
    ?.extension?.value;

  expect(lineUps).toBeUndefined();

  let teamMatchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM], roundNumbers: [1] },
  }).matchUps;
  expect(teamMatchUps.length).toEqual(2);

  const getLineUpsCount = (matchUp) =>
    matchUp.sides.flatMap((side) => side.lineUp).filter(Boolean).length;

  for (const dualMatchUp of teamMatchUps) {
    expect(getLineUpsCount(dualMatchUp)).toEqual(0);
    assignParticipants({ dualMatchUp });
  }

  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  lineUps = findExtension({ element: drawDefinition, name: LINEUPS })?.extension
    ?.value;

  expect(lineUps).toBeDefined();

  teamMatchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM], roundNumbers: [1] },
  }).matchUps;

  for (const dualMatchUp of teamMatchUps) {
    expect(getLineUpsCount(dualMatchUp)).toEqual(4);
  }

  // for { roundsNumber: 2 } there should be no lineUps
  teamMatchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM], roundNumbers: [2] },
  }).matchUps;

  const outcome = {
    score: { sets: [{ side1Score: 6, side2Score: 1, winningSide: 1 }] },
    winningSide: 1,
  };
  for (const dualMatchUp of teamMatchUps) {
    expect(getLineUpsCount(dualMatchUp)).toEqual(0);
    // after confiirming no lineUp, setMatchUpStatus for one tieMatchUp
    const matchUpId = dualMatchUp.tieMatchUps[0].matchUpId;
    const result = tournamentEngine.setMatchUpStatus({
      matchUpId,
      outcome,
      drawId,
    });
    expect(result.success).toEqual(true);
  }

  teamMatchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM], roundNumbers: [2] },
  }).matchUps;

  // when score was set lineUp was propagated to each team matchUp
  for (const dualMatchUp of teamMatchUps) {
    expect(getLineUpsCount(dualMatchUp)).toEqual(4);
  }
});

function assignParticipants({ dualMatchUp }) {
  const singlesMatchUps = dualMatchUp.tieMatchUps.filter(
    ({ matchUpType }) => matchUpType === SINGLES
  );
  singlesMatchUps.forEach((singlesMatchUp, i) => {
    const tieMatchUpId = singlesMatchUp.matchUpId;
    singlesMatchUp.sides.forEach((side) => {
      const { drawPosition } = side;
      const teamParticipant = dualMatchUp.sides.find(
        (side) => side.drawPosition === drawPosition
      )?.participant;
      if (teamParticipant) {
        const individualParticipantId =
          teamParticipant.individualParticipantIds[i];
        const result = tournamentEngine.assignTieMatchUpParticipantId({
          participantId: individualParticipantId,
          drawId: dualMatchUp.drawId,
          tieMatchUpId,
        });
        if (!result.success) console.log(result);
        expect(result.success).toEqual(true);
      }
    });
  });
}
