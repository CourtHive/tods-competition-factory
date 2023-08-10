import { tournamentEngine } from '../..';
import { expect, it } from 'vitest';
import fs from 'fs';

import { DOUBLES, TEAM } from '../../constants/matchUpTypes';

const tournamentRecordJSON = fs.readFileSync(
  './src/global/testHarness/assignTieMatchUpParticipant.tods.json',
  'utf-8'
);
const tournamentRecord = JSON.parse(tournamentRecordJSON);

it.skip('populates matchUp sides', () => {
  tournamentEngine.setState(tournamentRecord);

  const {
    matchUps: [matchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
  });
  const lineUps = matchUp.sides.map(({ lineUp }) => lineUp);
  const originalLineUp = lineUps[1];

  const { matchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [DOUBLES] },
  });
  const a = matchUps
    .filter((matchUp) => !matchUp.sides[1].participant)
    .map(({ sides, collectionPosition, collectionId }) => {
      const assignments = originalLineUp.filter((assignment) =>
        assignment.collectionAssignments.find(
          (a) =>
            a.collectionId === collectionId &&
            a.collectionPosition === collectionPosition
        )
      );
      return {
        side: sides[1],
        collectionId,
        collectionPosition,
        assignments,
      };
    });
  console.log(a[0].assignments);
});

it('assignMatchUpParticipantId will remove prior assignments', () => {
  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  const {
    matchUps: [matchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
  });
  const lineUps = matchUp.sides.map(({ lineUp }) => lineUp);
  const originalLineUp = lineUps[1];

  const tieMatchUpId = '9e3b56a2-69a5-45ce-b363-c3d67c5a5d26';
  const drawId = 'b64103e5-7e63-4a9f-a62c-8569b0a2fcae';

  let params = {
    participantId: 'A84C3E42-C60C-4772-BEAF-135E313CB90B',
    tieMatchUpId,
    drawId,
  };

  result = tournamentEngine.assignTieMatchUpParticipantId(params);
  expect(originalLineUp).not.toEqual(result.modifiedLineUp);

  params = {
    participantId: '24641B6A-6EFB-4599-8052-802576F8F332',
    tieMatchUpId,
    drawId,
  };
  result = tournamentEngine.assignTieMatchUpParticipantId(params);
  expect(originalLineUp).not.toEqual(result.modifiedLineUp);

  params = {
    participantId: '51FC341B-506B-4598-9880-AF7A9F4B8243',
    tieMatchUpId,
    drawId,
  };

  result = tournamentEngine.assignTieMatchUpParticipantId(params);
  expect(originalLineUp).not.toEqual(result.modifiedLineUp);

  params = {
    participantId: '24641B6A-6EFB-4599-8052-802576F8F332',
    tieMatchUpId,
    drawId,
  };
  result = tournamentEngine.assignTieMatchUpParticipantId(params);
  expect(originalLineUp).not.toEqual(result.modifiedLineUp);
  expect(result.success).toEqual(true);
});

it('can add a participant to a partial pair with a Substitute', () => {
  const tournamentJSON = fs.readFileSync(
    './src/global/testHarness/assignTieMatchUpParticipantSub.tods.json',
    'utf-8'
  );
  const tournament = JSON.parse(tournamentJSON);
  let result = tournamentEngine.setState(tournament);
  expect(result.success).toEqual(true);

  let params = {
    participantId: '32b181af-0f31-4b97-881b-4e9caa4180de',
    tieMatchUpId: '69b0156b-3cb1-4e0a-b148-8d796e2929c4',
    drawId: '21d8e860-41d8-4b2d-8f79-94c5758e2ad2',
  };

  result = tournamentEngine.assignTieMatchUpParticipantId(params);
  expect(result.success).toEqual(true);

  // there should be 3 participants which have assignments
  expect(
    result.modifiedLineUp.filter((l) => l.collectionAssignments.length).length
  ).toEqual(3);
});
