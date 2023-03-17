import { generateTeamTournament } from './generateTestTeamTournament';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import { DOUBLES, SINGLES } from '../../../constants/matchUpTypes';

it('can retrieve tieMatchUps by matchUpId using matchUpFilters', () => {
  const { tournamentRecord } = generateTeamTournament();
  tournamentEngine.setState(tournamentRecord);

  const {
    matchUps: [singlesMatchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [SINGLES] },
  });

  let { matchUpId, matchUpType } = singlesMatchUp;

  let {
    matchUps: [targetMatchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpIds: [matchUpId] },
  });
  expect(targetMatchUp.matchUpId).toEqual(matchUpId);
  expect(targetMatchUp.matchUpType).toEqual(matchUpType);

  const {
    matchUps: [doublesMatchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [DOUBLES] },
  });

  ({ matchUpId, matchUpType } = doublesMatchUp);

  ({
    matchUps: [targetMatchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpIds: [matchUpId] },
  }));
  expect(targetMatchUp.matchUpId).toEqual(matchUpId);
  expect(targetMatchUp.matchUpType).toEqual(matchUpType);
});
