import { mocksEngine, tournamentEngine } from '../../..';
import drawEngine from '../../sync';

import { LUCKY_DRAW } from '../../../constants/drawDefinitionConstants';

// prettier-ignore
const scenarios = [
  {
    drawSize: 11,
    expectation: {
      matchUpCounts: [6, 3, 2, 1],
      finishingPositionRanges: [
        [ [8, 12], [1, 7], ],
        [ [5, 6], [1, 4], ],
        [ [3, 4], [1, 2], ],
        [ [2, 2], [1, 1], ],
      ],
    },
  },
  {
    drawSize: 18,
    expectation: {
      matchUpCounts: [9, 5, 3, 2, 1],
      finishingPositionRanges: [
      [ [ 13, 18 ], [ 1, 12 ] ],
      [ [ 8, 10 ], [ 1, 7 ] ],
      [ [ 5, 6 ], [ 1, 4 ] ],
      [ [ 3, 4 ], [ 1, 2 ] ],
      [ [ 2, 2 ], [ 1, 1 ] ]
      ],
    },
  },
  {
    drawSize: 22,
    expectation: {
      matchUpCounts: [11, 6, 3, 2, 1],
      finishingPositionRanges: [
        [ [14, 22], [1, 13], ],
        [ [8, 12], [1, 7], ],
        [ [5, 6], [1, 4], ],
        [ [3, 4], [1, 2], ],
        [ [2, 2], [1, 1], ],
      ],
    },
  },
];

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

    if (expectation.matchUpCounts) {
      const matchUpCounts = Object.values(roundProfile).map(
        ({ matchUpsCount }) => matchUpsCount
      );
      expect(matchUpCounts).toEqual(expectation.matchUpCounts);
    }

    const finishingPositionRanges = Object.values(roundProfile).map(
      ({ finishingPositionRange }) => Object.values(finishingPositionRange)
    );
    if (expectation.finishingPositionRanges) {
      expect(finishingPositionRanges).toEqual(
        expectation.finishingPositionRanges
      );
    } else {
      console.log(finishingPositionRanges);
    }
  }
);
