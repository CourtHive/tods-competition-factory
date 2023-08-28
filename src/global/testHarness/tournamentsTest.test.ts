import { tournamentEngine } from '../..';
import { expect, it } from 'vitest';
import fs from 'fs';

import { CONSOLATION } from '../../constants/drawDefinitionConstants';
import {
  DOUBLE_WALKOVER,
  TO_BE_PLAYED,
} from '../../constants/matchUpStatusConstants';

it('WO/WO advances SF player to F and sets winningSide', () => {
  const tournamentRecordJSON = fs.readFileSync(
    './src/global/testHarness/tournamentOne.tods.json',
    'utf-8'
  );

  const tournamentRecord = JSON.parse(tournamentRecordJSON);

  tournamentEngine.setState(tournamentRecord);

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
  const tournamentRecordJSON = fs.readFileSync(
    './src/global/testHarness/tournamentTwo.tods.json',
    'utf-8'
  );

  const tournamentRecord = JSON.parse(tournamentRecordJSON);

  tournamentEngine.setState(tournamentRecord);

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
