import tournamentEngine from '../engines/syncEngine';
import { expect, it } from 'vitest';

import { CONSOLATION } from '../../constants/drawDefinitionConstants';
import {
  DOUBLE_WALKOVER,
  TO_BE_PLAYED,
} from '../../constants/matchUpStatusConstants';

import tournamentOne from './tournamentOne.tods.json';
import tournamentTwo from './tournamentTwo.tods.json';

it('WO/WO advances SF player to F and sets winningSide', () => {
  tournamentEngine.setState(tournamentOne);

  const { matchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpStatuses: [TO_BE_PLAYED] },
  });

  const targetMatchUp = matchUps.find(
    ({ stage, roundNumber, roundPosition }) =>
      stage === CONSOLATION && roundNumber === 4 && roundPosition === 2
  );
  const { drawId, matchUpId } = targetMatchUp;
  const result = tournamentEngine.setMatchUpStatus({
    outcome: { matchUpStatus: DOUBLE_WALKOVER },
    matchUpId: matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);
});

it('WO/WO advances SF player to F and sets winningSide', () => {
  tournamentEngine.setState(tournamentTwo);

  const { matchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpStatuses: [TO_BE_PLAYED] },
  });

  const targetMatchUp = matchUps.find(
    ({ stage, roundNumber, roundPosition }) =>
      stage === CONSOLATION && roundNumber === 4 && roundPosition === 2
  );
  const { drawId, matchUpId } = targetMatchUp;
  const result = tournamentEngine.setMatchUpStatus({
    outcome: { matchUpStatus: DOUBLE_WALKOVER },
    matchUpId: matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);
});
