import { tournamentEngine, mocksEngine } from '../../../';
import { expect, it } from 'vitest';

import {
  ROUND_ROBIN,
  ROUND_ROBIN_WITH_PLAYOFF,
} from '../../../constants/drawDefinitionConstants';

const scenarios = [
  {
    drawProfile: {
      structureOptions: { groupSize: 4 },
      drawType: ROUND_ROBIN_WITH_PLAYOFF,
      participantsCount: 8,
      drawSize: 32,
    },
    expectation: {
      playoffFinishingPositionRanges: [
        {
          finishingPosition: 2,
          finishingPositions: [9, 10, 11, 12, 13, 14, 15, 16],
          finishingPositionRange: '9-16',
        },
        {
          finishingPosition: 3,
          finishingPositions: [17, 18, 19, 20, 21, 22, 23, 24],
          finishingPositionRange: '17-24',
        },
        {
          finishingPosition: 4,
          finishingPositions: [25, 26, 27, 28, 29, 30, 31, 32],
          finishingPositionRange: '25-32',
        },
      ],
    },
  },
  {
    drawProfile: {
      structureOptions: { groupSize: 4 },
      drawType: ROUND_ROBIN,
      participantsCount: 8,
      drawSize: 8,
    },
    expectation: {
      playoffFinishingPositionRanges: [
        {
          finishingPosition: 1,
          finishingPositions: [1, 2],
          finishingPositionRange: '1-2',
        },
        {
          finishingPosition: 2,
          finishingPositions: [3, 4],
          finishingPositionRange: '3-4',
        },
        {
          finishingPosition: 3,
          finishingPositions: [5, 6],
          finishingPositionRange: '5-6',
        },
        {
          finishingPosition: 4,
          finishingPositions: [7, 8],
          finishingPositionRange: '7-8',
        },
      ],
    },
  },
];

it.each(scenarios)(
  'can determine available playoff rounds for ROUND_ROBIN structures',
  (scenario) => {
    const { drawProfile, expectation } = scenario;
    const {
      tournamentRecord,
      drawIds: [drawId],
    } = mocksEngine.generateTournamentRecord({
      drawProfiles: [drawProfile],
    });

    let result = tournamentEngine.setState(tournamentRecord);
    expect(result.success).toEqual(true);

    result = tournamentEngine.getAvailablePlayoffProfiles({ drawId });

    if (expectation) {
      expect(
        result.availablePlayoffProfiles[0].playoffFinishingPositionRanges
      ).toEqual(expectation.playoffFinishingPositionRanges);
    }
  }
);
