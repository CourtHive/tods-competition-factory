import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../../tournamentEngine/sync';
import { generateRange } from '../../../utilities';
import { getInitialRoundNumber } from '../getInitialRoundNumber';

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
      matchUps,
      drawPosition,
    });
    expect(initialRoundNumber).toEqual(1);
  });
});
