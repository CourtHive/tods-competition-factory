import { expect } from 'vitest';
import {
  getSeedBlocks,
  getSeedGroups,
  getSeedingThresholds,
} from '../../governors/positionGovernor/getSeedBlocks';

it('can generate seedBlocks, seedGroups and seedingThresholds', () => {
  const roundRobinGroupsCount = 8;
  const drawSize = 32;

  let { seedBlocks } = getSeedBlocks({ participantsCount: drawSize });
  expect(seedBlocks).toEqual([
    [1],
    [32],
    [9, 24],
    [5, 13, 20, 28],
    [3, 7, 11, 15, 18, 22, 26, 30],
    [31, 2, 29, 4, 27, 6, 25, 8, 23, 10, 21, 12, 19, 14, 17, 16],
  ]);

  let { seedGroups } = getSeedGroups({ drawSize });
  expect(seedGroups).toEqual([
    [1],
    [2],
    [3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12, 13, 14, 15, 16],
    [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32],
  ]);

  let { seedingThresholds } = getSeedingThresholds({
    participantsCount: drawSize,
  });
  expect(seedingThresholds).toEqual([1, 2, 3, 5, 9, 17]);

  let result = getSeedGroups({ roundRobinGroupsCount, drawSize });

  expect(result.seedGroups).toEqual([
    [1, 2, 3, 4, 5, 6, 7, 8],
    [9, 10, 11, 12, 13, 14, 15, 16],
    [17, 18, 19, 20, 21, 22, 23, 24],
    [25, 26, 27, 28, 29, 30, 31, 32],
  ]);
});

const scenarios = [
  {
    roundRobinGroupsCount: 5,
    expectation: [1, 6],
    seedGroupsCount: 2,
    drawSize: 13,
  },
  {
    roundRobinGroupsCount: 8,
    expectation: [1, 9, 17, 25],
    seedGroupsCount: 4,
    drawSize: 32,
  },
  {
    roundRobinGroupsCount: 10,
    expectation: [1, 11, 21],
    seedGroupsCount: 3,
    drawSize: 32,
  },
];

it.each(scenarios)(
  'can generate seedingThresholds for Round Robin groups',
  (scenario) => {
    const { drawSize, roundRobinGroupsCount, seedGroupsCount, expectation } =
      scenario;

    const { seedGroups } = getSeedGroups({ roundRobinGroupsCount, drawSize });

    const { seedingThresholds } = getSeedingThresholds({
      participantsCount: drawSize,
      roundRobinGroupsCount,
    });

    expect(seedGroups.length).toEqual(seedGroupsCount);
    expect(seedingThresholds).toEqual(expectation);
  }
);
