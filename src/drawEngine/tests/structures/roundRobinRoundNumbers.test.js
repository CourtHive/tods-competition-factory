import tournamentEngine from '../../../tournamentEngine/sync';
import { generateRange } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import drawEngine from '../../sync';

import { ROUND_ROBIN } from '../../../constants/drawDefinitionConstants';

it('generates roundNumbers for all matchUps when odd-sized groups', () => {
  const drawProfiles = [
    {
      drawSize: 5,
      participantsCount: 5,
      structureOptions: { groupSize: 5 },
      drawType: ROUND_ROBIN,
    },
  ];
  mocksEngine.generateTournamentRecord({
    drawProfiles,
  });

  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  expect(matchUps.map((m) => m.roundNumber)).toEqual([
    1,
    1,
    2,
    2,
    3,
    3,
    4,
    4,
    5,
    5,
  ]);
});

// 8 is the default maximum for group size
test.each([3, 4, 5, 6, 7, 8])(
  'can generate appropriate roundNumbers for event ROUND ROBIN group sizes',
  (groupSize) => {
    const roundNumbers = getRoundRobinRoundNumber({ groupSize });
    const isOdd = groupSize % 2;
    const roundsCount = isOdd ? groupSize + 1 : groupSize;
    const expectation = generateRange(1, roundsCount);
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
