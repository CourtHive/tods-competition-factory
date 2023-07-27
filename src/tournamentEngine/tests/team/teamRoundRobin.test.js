import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';
import { expect, test } from 'vitest';

import { ROUND_ROBIN } from '../../../constants/drawDefinitionConstants';
import { COMPLETED } from '../../../constants/matchUpStatusConstants';
import { TEAM_MATCHUP } from '../../../constants/matchUpTypes';
import { TEAM_EVENT } from '../../../constants/eventConstants';

// this test originated because an error was being thrown with this scenario
test('team ROUND_robin with 3 teams', () => {
  const drawProfiles = [
    {
      matchUpFormat: 'SET1-S:T30G',
      eventType: TEAM_EVENT,
      drawType: ROUND_ROBIN,
      drawSize: 3,
    },
  ];

  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });
  expect(tournamentRecord).not.toBeUndefined();

  tournamentEngine.devContext(true);
  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  let { matchUps } = tournamentEngine.allTournamentMatchUps({});
  let matchUp = matchUps.find(
    ({ matchUpType }) => matchUpType === TEAM_MATCHUP
  );

  const tieScore = {
    scoreStringSide1: '7-7',
    scoreStringSide2: '7-7',
    sets: [
      {
        side1Score: 7,
        side2Score: 7,
      },
    ],
  };
  let tieMatchUp = matchUp.tieMatchUps[0];
  result = tournamentEngine.setMatchUpStatus({
    outcome: { score: tieScore, matchUpStatus: COMPLETED },
    matchUpId: tieMatchUp.matchUpId,
    drawId: tieMatchUp.drawId,
  });
  expect(result.success).toEqual(true);

  // a tieMatchUp in the context of a Team Round Robin can be marked as COMPLETED with no winningSide
  const { drawId, matchUpId } = matchUp;
  result = tournamentEngine.setMatchUpStatus({
    outcome: { matchUpStatus: COMPLETED },
    matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  matchUp = tournamentEngine.findMatchUp({ drawId, matchUpId }).matchUp;
  expect(matchUp.matchUpStatus).toEqual(COMPLETED);

  tieMatchUp = tournamentEngine.findMatchUp({
    drawId,
    matchUpId: tieMatchUp.matchUpId,
  }).matchUp;
  expect(tieMatchUp.matchUpStatus).toEqual(COMPLETED);
  expect(tieMatchUp.winningSide).toBeUndefined();
});
