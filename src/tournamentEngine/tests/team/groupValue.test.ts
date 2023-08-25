import { generateRange, shuffleArray } from '../../../utilities';
import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';
import { expect, test } from 'vitest';

import { INDIVIDUAL, PAIR } from '../../../constants/participantConstants';
import { DOUBLES, SINGLES, TEAM } from '../../../constants/matchUpTypes';
import { COMPLETED } from '../../../constants/matchUpStatusConstants';
import {
  INVALID_MATCHUP,
  INVALID_VALUES,
  VALUE_UNCHANGED,
} from '../../../constants/errorConditionConstants';

test('groupValue can be used in tieFormats and lineUps can be applied after scoring is completed', () => {
  const mockProfile = {
    tournamentName: 'Brewer',
    drawProfiles: [
      { drawSize: 4, tieFormatName: 'USTA_BREWER_CUP', eventType: 'TEAM' },
    ],
  };

  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord(mockProfile);

  tournamentEngine.setState(tournamentRecord);

  const { tournamentParticipants } =
    tournamentEngine.getTournamentParticipants();
  expect(tournamentParticipants.length).toEqual(40);

  const { matchUps: singlesMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [SINGLES] },
  });
  expect(singlesMatchUps.length).toEqual(18);

  const { matchUps: doublesMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [DOUBLES] },
  });
  expect(doublesMatchUps.length).toEqual(9);

  const { outcome } = mocksEngine.generateOutcomeFromScoreString({
    matchUpStatus: COMPLETED,
    scoreString: '6-1 6-1',
    winningSide: 1,
  });
  const singlesMatchUpId = singlesMatchUps[0].matchUpId;
  let result = tournamentEngine.setMatchUpStatus({
    matchUpId: singlesMatchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  let { matchUps: teamMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
  });
  expect(teamMatchUps[0].score.sets[0].side1Score).toEqual(1);

  const doublesMatchUpId = doublesMatchUps[0].matchUpId;
  result = tournamentEngine.setMatchUpStatus({
    matchUpId: doublesMatchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  teamMatchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
  }).matchUps;
  // expect that the score has NOT changed because groupValue winCriteria not met
  expect(teamMatchUps[0].score.sets[0].side1Score).toEqual(1);

  // complete all first round doublesMatchUps
  doublesMatchUps
    .filter(({ roundNumber }) => roundNumber === 1)
    .forEach(({ matchUpId }) => {
      result = tournamentEngine.setMatchUpStatus({
        matchUpId,
        outcome,
        drawId,
      });
      expect(result.success).toEqual(true);
    });

  teamMatchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
  }).matchUps;

  // expect that first team matchUp now has awarded 1 for winning doubles group
  expect(teamMatchUps[0].score.sets[0].side1Score).toEqual(2);

  // expect that second team matchUp now has awarded 1 for winning doubles group
  expect(teamMatchUps[1].score.sets[0].side1Score).toEqual(1);

  // complete all first round singlesMatchUps
  singlesMatchUps
    .filter(({ roundNumber }) => roundNumber === 1)
    .forEach(({ matchUpId }) => {
      result = tournamentEngine.setMatchUpStatus({
        matchUpId,
        outcome,
        drawId,
      });
      expect(result.success).toEqual(true);
    });

  teamMatchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM], roundNumbers: [1] },
  }).matchUps;

  teamMatchUps.forEach((matchUp) => {
    expect(matchUp.score.scoreStringSide1).toEqual('7-0');
  });

  let teamMatchUp = teamMatchUps[0];
  const teamMatchUpId = teamMatchUp.matchUpId;

  // now apply lineUp to the sides of each matchUp
  result = tournamentEngine.applyLineUps({
    matchUpId: teamMatchUpId,
    drawId,
  });
  expect(result.error).toEqual(INVALID_VALUES);

  result = tournamentEngine.applyLineUps({
    matchUpId: teamMatchUpId,
    lineUps: {},
    drawId,
  });
  expect(result.error).toEqual(INVALID_VALUES);

  result = tournamentEngine.applyLineUps({
    matchUpId: { foo: 'nonStringId' },
    lineUps: [],
    drawId,
  });
  expect(result.error).toEqual(INVALID_MATCHUP);

  result = tournamentEngine.applyLineUps({
    matchUpId: singlesMatchUpId,
    lineUps: [],
    drawId,
  });
  expect(result.error).toEqual(INVALID_MATCHUP);

  result = tournamentEngine.applyLineUps({
    matchUpId: teamMatchUpId,
    lineUps: [],
    drawId,
  });
  expect(result.error).toEqual(VALUE_UNCHANGED);

  // now construct lineUp to apply
  const individualParticipantIds = teamMatchUp.sides.map(
    (side) => side.participant.individualParticipantIds
  );
  const { tieFormat } = tournamentEngine.getTieFormat({ drawId });

  const lineUpSides = [{}, {}];
  for (const collectionDefinition of tieFormat.collectionDefinitions) {
    const { collectionId, matchUpType, matchUpCount } = collectionDefinition;
    for (const side of [0, 1]) {
      const collectionPositions = generateRange(1, matchUpCount + 1);
      const multiplier = matchUpType === DOUBLES ? 2 : 1;
      const candidateParticipantIds = shuffleArray(
        individualParticipantIds[side]
      ).slice(0, collectionPositions.length * multiplier);

      for (const collectionPosition of collectionPositions) {
        const index = (collectionPosition - 1) * multiplier;
        const participantIds = candidateParticipantIds.slice(
          index,
          index + multiplier
        );
        for (const participantId of participantIds) {
          const assignment = {
            collectionId,
            collectionPosition,
            matchUpType,
          };
          if (!lineUpSides[side][participantId])
            lineUpSides[side][participantId] = {
              collectionAssignments: [],
              participantId,
            };

          lineUpSides[side][participantId].collectionAssignments.push(
            assignment
          );
        }
      }
    }
  }

  const lineUps = lineUpSides.map((side) => Object.values(side));

  const doublesCount = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [PAIR] },
  }).tournamentParticipants.length;
  expect(doublesCount).toEqual(12);

  result = tournamentEngine.applyLineUps({
    matchUpId: teamMatchUpId,
    lineUps,
    drawId,
  });
  expect(result.success).toEqual(true);

  const newDoublesCount = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [PAIR] },
  }).tournamentParticipants.length;

  // expect that some new doubles pairs have been created
  expect(newDoublesCount).toBeGreaterThan(doublesCount);

  teamMatchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
  }).matchUps;

  teamMatchUp = teamMatchUps.find(
    (matchUp) => matchUp.matchUpId === teamMatchUpId
  );
  teamMatchUp.sides.forEach((side) => expect(side.lineUp).not.toBeUndefined());

  const tieMatchUps = teamMatchUp.tieMatchUps;
  const singlesTieMatchUps = tieMatchUps.filter(
    (matchUp) => matchUp.matchUpType === SINGLES
  );

  singlesTieMatchUps.forEach((matchUp) => {
    matchUp.sides.forEach((side) =>
      expect(side.participant.participantType).toEqual(INDIVIDUAL)
    );
  });

  const doublesTieMatchUps = tieMatchUps.filter(
    (matchUp) => matchUp.matchUpType === DOUBLES
  );
  doublesTieMatchUps.forEach((matchUp) => {
    matchUp.sides.forEach((side) =>
      expect(side.participant.participantType).toEqual(PAIR)
    );
  });
});
