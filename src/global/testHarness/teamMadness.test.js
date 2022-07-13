import { tournamentEngine, mocksEngine } from '../..';
import { numericSort, unique } from '../../utilities';
import fs from 'fs';

import { TEAM as PARTICIPANT_TEAM } from '../../constants/participantConstants';
import { TEAM as EVENT_TEAM } from '../../constants/eventConstants';
import { INDIVIDUAL, PAIR } from '../../constants/participantTypes';
import { DOUBLES, SINGLES, TEAM } from '../../constants/matchUpTypes';

// node --expose-gc ./node_modules/.bin/jest --runInBand --logHeapUsage --watch madness
it('withOpponents adds appropriate opponents', () => {
  let tournamentRecordJSON = fs.readFileSync(
    './src/global/testHarness/teamMadness.tods.json',
    'utf-8'
  );

  let tournamentRecord = JSON.parse(tournamentRecordJSON);
  mocksEngine.anonymizeTournamentRecord({ tournamentRecord });
  tournamentEngine.setState(tournamentRecord);

  let result = tournamentEngine
    .devContext({ makeDeepCopy: true, iterations: 7 })
    .allTournamentMatchUps({ inContext: true });
  const matchUps = result.matchUps;
  expect(matchUps.length).toEqual(240);

  result = tournamentEngine
    .devContext({ makeDeepCopy: true, iterationThreshold: 15 })
    .getTournamentParticipants({
      inContext: true,
      withGroupings: true,
      withMatchUps: true,
      convertExtensions: true,
      withStatistics: true,
      withOpponents: true,
    });

  // zero indicates that iterations did not exceed the threshold
  expect(result.deepCopyIterations).toEqual(0);

  const tournamentParticipants = result.tournamentParticipants;
  expect(tournamentParticipants.length).toEqual(314);

  const individualParticipants = tournamentParticipants.filter(
    ({ participantType }) => participantType === INDIVIDUAL
  );

  const pairParticipants = tournamentParticipants.filter(
    ({ participantType }) => participantType === PAIR
  );

  const teamParticipants = tournamentParticipants.filter(
    ({ participantType }) => participantType === PARTICIPANT_TEAM
  );

  const iOpponentsCount = unique(
    individualParticipants.map((ip) => ip.opponents?.length || 0)
  ).sort(numericSort);
  const pOpponentsCount = unique(
    pairParticipants.map((ip) => ip.opponents?.length || 0)
  ).sort(numericSort);
  const tOpponentsCount = unique(
    teamParticipants.map((ip) => ip.opponents?.length || 0)
  ).sort(numericSort);

  expect(tOpponentsCount).toEqual([3]);
  expect(pOpponentsCount).toEqual([0, 1, 2, 3]);
  expect(iOpponentsCount).toEqual([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
  ]);

  const iMatchUpsCount = unique(
    individualParticipants.map((ip) => ip.matchUps?.length || 0)
  ).sort(numericSort);
  const pMatchUpsCount = unique(
    pairParticipants.map((ip) => ip.matchUps?.length || 0)
  ).sort(numericSort);
  const tMatchUpsCount = unique(
    teamParticipants.map((ip) => ip.matchUps?.length || 0)
  ).sort(numericSort);

  expect(tMatchUpsCount).toEqual([30]);
  expect(pMatchUpsCount).toEqual([0, 1, 2, 3]);
  expect(iMatchUpsCount).toEqual([0, 1, 2, 3, 4, 5, 6]);

  expect(
    unique(
      teamParticipants
        .map((participant) =>
          (participant.matchUps || []).map(({ matchUpType }) => matchUpType)
        )
        .flat()
    )
  ).toEqual([TEAM]);

  expect(
    unique(
      pairParticipants
        .map((participant) =>
          (participant.matchUps || []).map(({ matchUpType }) => matchUpType)
        )
        .flat()
    )
  ).toEqual([DOUBLES]);

  expect(
    unique(
      individualParticipants
        .map((participant) =>
          (participant.matchUps || []).map(({ matchUpType }) => matchUpType)
        )
        .flat()
    ).sort()
  ).toEqual([DOUBLES, SINGLES]);
});

it('returns expected opponents for withOpponents', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ eventType: EVENT_TEAM, drawSize: 2 }],
  });

  tournamentEngine.setState(tournamentRecord);

  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    withOpponents: true,
  });

  let individualParticipants = tournamentParticipants.filter(
    ({ participantType }) => participantType === INDIVIDUAL
  );

  const teamParticipants = tournamentParticipants.filter(
    ({ participantType }) => participantType === PARTICIPANT_TEAM
  );

  expect(teamParticipants.length).toEqual(2);
  const team = teamParticipants[0];

  let matchUps = tournamentEngine.allTournamentMatchUps({
    contextFilters: { participantIds: [team.participantId] },
  }).matchUps;
  expect(matchUps.length).toEqual(1);
  expect(team.opponents.length);

  expect(individualParticipants.length).toEqual(12);
  let participant = individualParticipants[0];
  const participantId = participant.participantId;

  matchUps = tournamentEngine.allTournamentMatchUps({
    contextFilters: { participantIds: [participantId] },
  }).matchUps;
  // no lineUps have been defined
  expect(matchUps.length).toEqual(0);
  expect(participant.opponents?.length).toBeUndefined();

  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { positionAssignments } = drawDefinition.structures[0];
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

  let { matchUps: firstRoundDualMatchUps } =
    tournamentEngine.allTournamentMatchUps({
      matchUpFilters: {
        matchUpTypes: [TEAM],
        roundNumbers: [1],
      },
    });

  firstRoundDualMatchUps.forEach(assignParticipants);

  matchUps = tournamentEngine.allTournamentMatchUps({
    contextFilters: { participantIds: [participantId] },
  }).matchUps;
  // lineUps have been defined so expect a matchUp
  expect(matchUps.length).toEqual(1);

  tournamentParticipants = tournamentEngine.getTournamentParticipants({
    withOpponents: true,
  }).tournamentParticipants;

  participant = tournamentParticipants.find(
    (participant) => participant.participantId === participantId
  );
  expect(participant.opponents.length).toEqual(1);

  individualParticipants = tournamentParticipants.filter(
    ({ participantType }) => participantType === INDIVIDUAL
  );

  const iOpponentsCount = individualParticipants.map(
    (ip) => ip.opponents?.length || 0
  );
  expect(unique(iOpponentsCount)).toEqual([1]);
});
