import { getPositionsPlayedOff } from '../../../drawEngine/governors/structureGovernor/getPositionsPlayedOff';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import {
  ROUND_ROBIN,
  SINGLE_ELIMINATION,
} from '../../../constants/drawDefinitionConstants';

it('cann add ROUND_ROBIN playoff structures', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawType: ROUND_ROBIN, drawSize: 8 }],
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  let drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  const structureId = drawDefinition.structures[0].structureId;

  const getAvailablePlayoffs = {
    method: 'getAvailablePlayoffProfiles',
    params: {
      structureId,
      drawId,
    },
  };

  result = tournamentEngine.executionQueue([getAvailablePlayoffs]);
  expect(result.results.length).toEqual(1); // not a mutation; not expecting SUCCESS

  expect(result.results[0].positionsNotPlayedOff).toEqual([
    1, 2, 3, 4, 5, 6, 7, 8,
  ]);

  const playoffFinishingPositionRanges =
    result.results[0].playoffFinishingPositionRanges;
  expect(playoffFinishingPositionRanges).toEqual([
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
  ]);

  let methods = [
    {
      method: 'addPlayoffStructures',
      params: {
        structureId,
        drawId,

        playoffGroups: [
          {
            finishingPositions: [1],
            drawType: SINGLE_ELIMINATION,
            structureName: 'Playoff 1-2',
          },
          {
            finishingPositions: [3],
            drawType: SINGLE_ELIMINATION,
            structureName: 'Playoff 5-6',
          },
        ],
      },
    },
  ];

  result = tournamentEngine.executionQueue(methods);
  expect(result.success).toEqual(true);

  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  result = getPositionsPlayedOff({ drawDefinition });
  expect(result).toEqual({
    positionsNotPlayedOff: [3, 4, 7, 8],
    positionsPlayedOff: [1, 2, 5, 6],
  });

  result = tournamentEngine.executionQueue([getAvailablePlayoffs]);
  expect(result.results[0].positionsNotPlayedOff).toEqual([3, 4, 7, 8]);

  methods = [
    {
      method: 'addPlayoffStructures',
      params: {
        structureId,
        drawId,

        playoffGroups: [
          {
            finishingPositions: [2],
            drawType: SINGLE_ELIMINATION,
            structureName: 'Playoff 3-4',
          },
          {
            finishingPositions: [4],
            drawType: SINGLE_ELIMINATION,
            structureName: 'Playoff 7-8',
          },
        ],
      },
    },
  ];

  result = tournamentEngine.executionQueue(methods);
  expect(result.success).toEqual(true);
});
