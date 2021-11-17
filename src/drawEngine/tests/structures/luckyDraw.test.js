import { mocksEngine, tournamentEngine } from '../../..';
import drawEngine from '../../sync';

import { LUCKY_DRAW } from '../../../constants/drawDefinitionConstants';

/*
const drawSizes = [
  7, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
  29, 30, 31,
];
*/

const scenarios = [{ drawSize: 22, expectation: [11, 6, 3, 2, 1] }];

test.each(scenarios)(
  'it can generate luckyDraw structures for any drawSize',
  ({ drawSize, expectation }) => {
    const drawProfiles = [{ drawSize, drawType: LUCKY_DRAW }];
    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      drawProfiles,
    });

    tournamentEngine.setState(tournamentRecord);

    const { matchUps } = tournamentEngine.allTournamentMatchUps();

    const { roundProfile } = drawEngine.getRoundMatchUps({
      matchUps,
    });
    const matchUpCounts = Object.values(roundProfile).map(
      ({ matchUpsCount }) => matchUpsCount
    );
    expect(matchUpCounts).toEqual(expectation);
    // console.log(Object.values(roundProfile));
  }
);
