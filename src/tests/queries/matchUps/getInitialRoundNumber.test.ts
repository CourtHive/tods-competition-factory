import { getInitialRoundNumber } from '@Query/matchUps/getInitialRoundNumber';
import mocksEngine from '@Assemblies/engines/mock';
import { generateRange } from '@Tools/arrays';
import tournamentEngine from '@Engines/syncEngine';
import { expect, it } from 'vitest';

import { ROUND_ROBIN } from '@Constants/drawDefinitionConstants';

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
