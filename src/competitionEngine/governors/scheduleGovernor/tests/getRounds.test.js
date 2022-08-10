import { mocksEngine } from '../../../../mocksEngine';
import { competitionEngine } from '../../../sync';
import { expect, it } from 'vitest';

import { MISSING_TOURNAMENT_RECORDS } from '../../../../constants/errorConditionConstants';
import {
  CURTIS_CONSOLATION,
  ROUND_ROBIN_WITH_PLAYOFF,
} from '../../../../constants/drawDefinitionConstants';

it('can generate tournament rounds', () => {
  let result = competitionEngine.getRounds();
  expect(result.error).toEqual(MISSING_TOURNAMENT_RECORDS);

  const drawProfiles = [
    { drawSize: 32, drawType: CURTIS_CONSOLATION },
    { drawSize: 16, drawType: ROUND_ROBIN_WITH_PLAYOFF },
  ];

  const { tournamentRecord } =
    mocksEngine.generateTournamentRecord(drawProfiles);

  competitionEngine.setState(tournamentRecord);
  result = competitionEngine.getRounds();
  console.log(result);
});
