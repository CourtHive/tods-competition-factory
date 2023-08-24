import { getPositionAssignments } from '../../getters/positionsGetter';
import { mocksEngine, tournamentEngine } from '../../..';
import { expect, test } from 'vitest';
import drawEngine from '../../sync';

import { LUCKY_DRAW } from '../../../constants/drawDefinitionConstants';
import { BYE } from '../../../constants/matchUpStatusConstants';
import { DOUBLES } from '../../../constants/eventConstants';

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
    const firstRoundByeMatchUps = matchUps.filter(
      ({ roundNumber, matchUpStatus }) =>
        roundNumber === 1 && matchUpStatus === BYE
    );
    expect(firstRoundByeMatchUps.length).toBeLessThanOrEqual(1);

    const { roundProfile } = drawEngine.getRoundMatchUps({
      matchUps,
    });

    if (expectation.matchUpCounts) {
      const matchUpCounts = Object.values(roundProfile).map(
        (values: any) => values.matchUpsCount
      );
      expect(matchUpCounts).toEqual(expectation.matchUpCounts);
    }

    const finishingPositionRanges = Object.values(roundProfile).map(
      (values: any) => Object.values(values.finishingPositionRange)
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

test('drawProfile scenario coverage', () => {
  const drawProfiles = [
    {
      drawType: LUCKY_DRAW,
      eventType: DOUBLES,
      drawSize: 7,
    },
  ];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });

  tournamentEngine.setState(tournamentRecord);
});

test('drawProfile participant generation', () => {
  const drawSize = 9;
  const drawProfiles = [
    {
      drawType: LUCKY_DRAW,
      drawSize,
    },
  ];
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });

  tournamentEngine.setState(tournamentRecord);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const structureId = drawDefinition.structures[0].structureId;

  const { positionAssignments } = getPositionAssignments({
    drawDefinition,
    structureId,
  });
  const allPositionsFilled = positionAssignments?.every(
    (assignment) => assignment.bye || assignment.participantId
  );
  expect(allPositionsFilled).toEqual(true);
  expect(tournamentRecord.participants.length).toEqual(drawSize);
});
