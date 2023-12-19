import tournamentEngine from '../../../test/engines/tournamentEngine';
import { getInitialRoundNumber } from '../getInitialRoundNumber';
import { generateRange } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import { expect, it } from 'vitest';

import { ROUND_ROBIN } from '../../../constants/drawDefinitionConstants';

it('can accurately determine initialRoundNumber', () => {
  const drawProfiles = [
    {
      drawType: ROUND_ROBIN,
      drawSize: 8,
    },
  ];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });

  tournamentEngine.setState(tournamentRecord);
  const { matchUps } = tournamentEngine.allTournamentMatchUps();

  generateRange(1, 9).forEach((drawPosition) => {
    const { initialRoundNumber } = getInitialRoundNumber({
      drawPosition,
      matchUps,
    });
    expect(initialRoundNumber).toEqual(1);
  });
});
