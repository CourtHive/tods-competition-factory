import { generateTieMatchUpScore } from '../../../drawEngine/accessors/matchUpAccessor';
import { findExtension } from '../../governors/queryGovernor/extensionQueries';
import { generateTeamTournament } from './generateTestTeamTournament';
import { tieFormats } from '../../../fixtures/scoring/tieFormats';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { TEAM_NOT_FOUND } from '../../../constants/errorConditionConstants';
import { DOUBLES, SINGLES, TEAM } from '../../../constants/matchUpTypes';
import { INDIVIDUAL } from '../../../constants/participantTypes';
import { LINEUPS } from '../../../constants/extensionConstants';
import {
  COMPLETED,
  IN_PROGRESS,
} from '../../../constants/matchUpStatusConstants';
import {
  CONSOLATION,
  FIRST_MATCH_LOSER_CONSOLATION,
  MAIN,
} from '../../../constants/drawDefinitionConstants';

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

// prettier-ignore
const scenarios = [
  { drawSize: 2, singlesCount: 1, doublesCount: 0, valueGoal: 1, expectLineUps: true },
  { drawSize: 2, singlesCount: 0, doublesCount: 1, valueGoal: 1, expectLineUps: false },
  { drawSize: 2, singlesCount: 3, doublesCount: 0, valueGoal: 2, expectLineUps: true },
  { drawSize: 4, singlesCount: 3, doublesCount: 0, valueGoal: 2, expectLineUps: true },
  { drawSize: 8, singlesCount: 3, doublesCount: 0, valueGoal: 2, expectLineUps: true },
  { drawSize: 8, singlesCount: 6, doublesCount: 3, valueGoal: 5, expectLineUps: true, tieFormatTest: true, scoreStringSide1: '7-0' },
  { drawType: FIRST_MATCH_LOSER_CONSOLATION, drawSize: 8, singlesCount: 6, doublesCount: 3, valueGoal: 5 },
];

it.each(scenarios)('can advance teamParticipants', (scenario) => {
  const { tournamentRecord, drawId, eventId, valueGoal, expectLineUps } =
    generateTeamTournament(scenario);
  expect(valueGoal).toEqual(scenario.valueGoal);

  tournamentEngine.setState(tournamentRecord);

  let { matchUps: firstRoundDualMatchUps } =
    tournamentEngine.allTournamentMatchUps({
      contextFilters: {
        stages: [MAIN],
      },
      matchUpFilters: {
        matchUpTypes: [TEAM],
        roundNumbers: [1],
      },
    });

  expect(firstRoundDualMatchUps.length).toBeGreaterThan(0);

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

  firstRoundDualMatchUps.forEach(assignParticipants);

  if (expectLineUps) {
    ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
    const { extension } = findExtension({
      element: drawDefinition,
      name: LINEUPS,
    });
    expect(extension).not.toBeUndefined();
  }

  teamParticipants.forEach(({ participantId }) => {
    const { lineUp } = tournamentEngine.getTeamLineUp({
      participantId,
      drawId,
    });
    if (expectLineUps) expect(lineUp).not.toBeUndefined();
  });

  // for each first round dualMatchUp assign individualParticipants to singles matchUps
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

    // attempt to assign orderOfFinish to all singlesMatchUps
    const finishingOrder = singlesMatchUps.map(({ matchUpId }, index) => ({
      orderOfFinish: index + 1,
      matchUpId,
    }));
    const result = tournamentEngine.setOrderOfFinish({
      finishingOrder,
      drawId,
    });
    expect(result.success).toEqual(true);

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
      contextFilters: {
        stages: [MAIN],
      },
      matchUpFilters: {
        matchUpTypes: [TEAM],
        roundNumbers: [1],
      },
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

  const { matchUps: firstRoundConsolationDuals } =
    tournamentEngine.allTournamentMatchUps({
      contextFilters: {
        stages: [CONSOLATION],
      },
      matchUpFilters: {
        matchUpTypes: [TEAM],
        roundNumbers: [1],
      },
    });

  if (firstRoundConsolationDuals.length) {
    firstRoundConsolationDuals.forEach((dualMatchUp) => {
      expect(dualMatchUp.readyToScore).toEqual(true);
      expect(dualMatchUp.sides.length).toEqual(2);
      expect(dualMatchUp.sides[0].lineUp).not.toBeUndefined();
      expect(dualMatchUp.sides[0].participantId).not.toBeUndefined;
    });
  }

  if (scenario.tieFormatTest) {
    const matchUp = firstRoundDualMatchUps[0];
    matchUp.tieFormat.collectionDefinitions.forEach((collectionDefinition) => {
      if (collectionDefinition.matchUpType === DOUBLES) {
        delete collectionDefinition.matchUpValue;
        collectionDefinition.collectionValue = 1;
      }
    });
    const result = generateTieMatchUpScore({ matchUp });
    expect(result.scoreStringSide1).toEqual(scenario.scoreStringSide1);
  }
});

test('participants for other teams cannot be assigned without teamParticipantId', () => {
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

test('tieFormat with scoreValue calculation', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { eventType: TEAM, tieFormatName: tieFormats.TEAM_AGGREGATION },
    ],
  });

  tournamentEngine.setState(tournamentRecord);
});
