import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';
import { expect, test } from 'vitest';

import { ROUND_ROBIN } from '../../../constants/drawDefinitionConstants';
import { COMPLETED } from '../../../constants/matchUpStatusConstants';
import { TEAM_EVENT } from '../../../constants/eventConstants';
import { TEAM_MATCHUP } from '../../../constants/matchUpTypes';

// this test originated because an error was being thrown with this scenario
test('team ROUND_robin with 3 teams', () => {
  const drawProfiles = [
    { drawSize: 3, drawType: ROUND_ROBIN, eventType: TEAM_EVENT },
  ];

  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });
  expect(tournamentRecord).not.toBeUndefined();

  tournamentEngine.devContext(true);
  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  let {
    matchUps: [matchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM_MATCHUP] },
  });
  const { drawId, matchUpId } = matchUp;

  result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId,
    outcome: { matchUpStatus: COMPLETED },
  });
  expect(result.success).toEqual(true);

  matchUp = tournamentEngine.findMatchUp({ drawId, matchUpId }).matchUp;
  expect(matchUp.matchUpStatus).toEqual(COMPLETED);
});
