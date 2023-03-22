import { tournamentEngine } from '../..';
import { expect, it } from 'vitest';
import fs from 'fs';

import { CONSOLATION } from '../../constants/drawDefinitionConstants';
import {
  DOUBLE_WALKOVER,
  TO_BE_PLAYED,
} from '../../constants/matchUpStatusConstants';

it('WO/WO advances SF player to F and sets winningSide', () => {
  let tournamentRecordJSON = fs.readFileSync(
    './src/global/testHarness/tournamentOne.tods.json',
    'utf-8'
  );

  let tournamentRecord = JSON.parse(tournamentRecordJSON);

  tournamentEngine.setState(tournamentRecord);

  let { matchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpStatuses: [TO_BE_PLAYED] },
  });

  let targetMatchUp = matchUps.find(
    ({ stage, roundNumber, roundPosition }) =>
      stage === CONSOLATION && roundNumber === 4 && roundPosition === 2
  );
  const { drawId, matchUpId } = targetMatchUp;
  let result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId: matchUpId,
    outcome: { matchUpStatus: DOUBLE_WALKOVER },
  });
  expect(result.success).toEqual(true);

  ({ matchUps } = tournamentEngine.allTournamentMatchUps());

  targetMatchUp = matchUps.find(({ roundName }) => roundName === 'C-F');
});

it('WO/WO advances SF player to F and sets winningSide', () => {
  let tournamentRecordJSON = fs.readFileSync(
    './src/global/testHarness/tournamentTwo.tods.json',
    'utf-8'
  );

  let tournamentRecord = JSON.parse(tournamentRecordJSON);

  tournamentEngine.setState(tournamentRecord);

  let { matchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpStatuses: [TO_BE_PLAYED] },
  });

  let targetMatchUp = matchUps.find(
    ({ stage, roundNumber, roundPosition }) =>
      stage === CONSOLATION && roundNumber === 4 && roundPosition === 2
  );
  const { drawId, matchUpId } = targetMatchUp;
  let result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId: matchUpId,
    outcome: { matchUpStatus: DOUBLE_WALKOVER },
  });
  expect(result.success).toEqual(true);

  ({ matchUps } = tournamentEngine.allTournamentMatchUps());

  targetMatchUp = matchUps.find(({ roundName }) => roundName === 'C-F');
});
