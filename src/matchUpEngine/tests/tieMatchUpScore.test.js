import tournamentEngine from '../../tournamentEngine/sync';
import mocksEngine from '../../mocksEngine';
import { expect, it } from 'vitest';

import { DOUBLES, SINGLES, TEAM_MATCHUP } from '../../constants/matchUpTypes';
import { TEAM_EVENT } from '../../constants/eventConstants';

it('calculates tieMatchUpScore properly with 1 point per game won and tiebreak sets', () => {
  const tieFormat = {
    winCriteria: {
      aggregateValue: true,
    },
    collectionDefinitions: [
      {
        collectionId: 'singlesCollectionId',
        collectionGroupNumber: 1,
        collectionName: 'Singles',
        matchUpFormat: 'SET3-S:6/TB10-F:TB10',
        matchUpType: SINGLES,
        matchUpCount: 6,
        scoreValue: 1,
      },
      {
        collectionId: 'doublesCollectionId',
        collectionGroupNumber: 1,
        collectionName: 'Doubles',
        matchUpFormat: 'SET3-S:6/TB10-F:TB10',
        matchUpType: DOUBLES,
        matchUpCount: 3,
        scoreValue: 1,
      },
    ],
  };
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 2, eventType: TEAM_EVENT, tieFormat }],
  });

  tournamentEngine.setState(tournamentRecord);

  let matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  let singlesMatchUp = matchUps.find(
    ({ matchUpType }) => matchUpType === SINGLES
  );

  let outcome = {
    winningSide: 2,
    score: {
      sets: [
        {
          setNumber: 1,
          side1Score: 6,
          side2Score: 1,
          winningSide: 1,
        },
        {
          setNumber: 2,
          side1Score: 1,
          side2Score: 6,
          winningSide: 2,
        },
        {
          setNumber: 3,
          side1TiebreakScore: 1,
          side2TiebreakScore: 10,
          winningSide: 2,
        },
      ],
    },
  };
  let result = tournamentEngine.setMatchUpStatus({
    matchUpId: singlesMatchUp.matchUpId,
    drawId: singlesMatchUp.drawId,
    outcome,
  });
  expect(result.success).toEqual(true);

  matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  singlesMatchUp = matchUps.find(({ matchUpType }) => matchUpType === SINGLES);
  expect(singlesMatchUp.score.scoreStringSide1).toEqual('6-1 1-6 [1-10]');
  let teamMatchUp = matchUps.find(
    ({ matchUpType }) => matchUpType === TEAM_MATCHUP
  );
  expect(teamMatchUp.score.scoreStringSide1).toEqual('7-8');
});
