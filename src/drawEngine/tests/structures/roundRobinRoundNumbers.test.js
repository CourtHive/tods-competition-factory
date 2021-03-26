import tournamentEngine from '../../../tournamentEngine/sync';
import { generateRange } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import drawEngine from '../../sync';

import { ROUND_ROBIN } from '../../../constants/drawDefinitionConstants';

// 8 is the default maximum for group size
test.each([3, 4, 5, 6, 7, 8])(
  'can generate appropriate roundNumbers for event ROUND ROBIN group sizes',
  (groupSize) => {
    let roundNumbers = getRoundRobinRoundNumber({ groupSize });
    const expectation = generateRange(1, groupSize);
    expect(roundNumbers).toEqual(expectation);
  }
);

function getRoundRobinRoundNumber({ groupSize }) {
  const drawProfiles = [
    {
      drawSize: groupSize,
      participantsCount: groupSize,
      structureOptions: { groupSize },
      drawType: ROUND_ROBIN,
    },
  ];
  mocksEngine.generateTournamentRecord({
    drawProfiles,
  });

  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  const { roundMatchUps } = drawEngine.getRoundMatchUps({ matchUps });
  return Object.keys(roundMatchUps).map((n) => parseInt(n));
}
