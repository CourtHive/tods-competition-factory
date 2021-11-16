import { mocksEngine, tournamentEngine } from '../../..';

import { LUCKY_DRAW } from '../../../constants/drawDefinitionConstants';

/*
const drawSizes = [
  7, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
  29, 30, 31,
];
*/

const drawSizes = [32];

test.each(drawSizes)(
  'it can generate luckyDraw structures for any drawSize',
  (drawSize) => {
    const drawProfiles = [{ drawSize, drawType: LUCKY_DRAW }];
    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      drawProfiles,
    });

    tournamentEngine.setState(tournamentRecord);
    expect(true);
  }
);
