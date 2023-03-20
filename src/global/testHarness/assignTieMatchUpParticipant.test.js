import { tournamentEngine } from '../..';
import { expect, it } from 'vitest';
import fs from 'fs';

import { DOUBLES, TEAM } from '../../constants/matchUpTypes';

const tournamentRecordJSON = fs.readFileSync(
  './src/global/testHarness/assignTieMatchUpParticipant.tods.json',
  'utf-8'
);

it.skip('populates matchUp sides', () => {
  const tournamentRecord = JSON.parse(tournamentRecordJSON);
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
  const tournamentRecord = JSON.parse(tournamentRecordJSON);
  tournamentEngine.setState(tournamentRecord);

  let result, params;

  const {
    matchUps: [matchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
  });
  const lineUps = matchUp.sides.map(({ lineUp }) => lineUp);
  const originalLineUp = lineUps[1];

  params = {
    drawId: 'b64103e5-7e63-4a9f-a62c-8569b0a2fcae',
    participantId: 'A84C3E42-C60C-4772-BEAF-135E313CB90B',
    tieMatchUpId: '9e3b56a2-69a5-45ce-b363-c3d67c5a5d26',
  };

  result = tournamentEngine.assignTieMatchUpParticipantId(params);
  expect(originalLineUp).not.toEqual(result.modifiedLineUp);

  params = {
    drawId: 'b64103e5-7e63-4a9f-a62c-8569b0a2fcae',
    participantId: '24641B6A-6EFB-4599-8052-802576F8F332',
    tieMatchUpId: '9e3b56a2-69a5-45ce-b363-c3d67c5a5d26',
  };
  result = tournamentEngine.assignTieMatchUpParticipantId(params);
  expect(originalLineUp).not.toEqual(result.modifiedLineUp);

  params = {
    drawId: 'b64103e5-7e63-4a9f-a62c-8569b0a2fcae',
    participantId: '51FC341B-506B-4598-9880-AF7A9F4B8243',
    tieMatchUpId: '9e3b56a2-69a5-45ce-b363-c3d67c5a5d26',
  };

  result = tournamentEngine.assignTieMatchUpParticipantId(params);
  expect(originalLineUp).not.toEqual(result.modifiedLineUp);

  params = {
    drawId: 'b64103e5-7e63-4a9f-a62c-8569b0a2fcae',
    participantId: '24641B6A-6EFB-4599-8052-802576F8F332',
    tieMatchUpId: '9e3b56a2-69a5-45ce-b363-c3d67c5a5d26',
  };
  result = tournamentEngine.assignTieMatchUpParticipantId(params);
  expect(originalLineUp).not.toEqual(result.modifiedLineUp);
  expect(result.success).toEqual(true);
});
