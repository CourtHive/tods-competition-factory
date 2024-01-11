import { roundRobinWithPlayoffsTest } from './roundRobinWithPlayoffsTest';
import { expect, it } from 'vitest';

import { SINGLE_ELIMINATION } from '../../../../../constants/drawDefinitionConstants';

it.skip('can generate Playoffs for Round Robins when BYEs are present (1)', () => {
  const playoffGroups = [
    {
      finishingPositions: [1, 2],
      structureName: 'Gold Flight',
      drawType: SINGLE_ELIMINATION,
      positionAssignmentsCount: 8,
      participantIdsCount: 8,
      byesCount: 0,
    },
    {
      finishingPositions: [3, 4],
      structureName: 'Silver Flight',
      drawType: SINGLE_ELIMINATION,
      positionAssignmentsCount: 8,
      participantIdsCount: 7,
      byesCount: 1,
    },
  ];
  roundRobinWithPlayoffsTest({
    drawSize: 16,
    groupSize: 4,
    playoffGroups,
    participantsCount: 15,
    finishingGroupSizes: [4, 4, 4, 3],
  });
});

it('can generate Playoffs for Round Robins when BYEs are present (2)', () => {
  const playoffGroups = [
    {
      finishingPositions: [1, 2],
      structureName: 'Gold Flight',
      drawType: SINGLE_ELIMINATION,
      positionAssignmentsCount: 8,
      participantIdsCount: 8,
      byesCount: 0,
    },
    {
      finishingPositions: [3, 4],
      structureName: 'Silver Flight',
      drawType: SINGLE_ELIMINATION,
      positionAssignmentsCount: 8,
      participantIdsCount: 6,
      byesCount: 2,
    },
  ];
  roundRobinWithPlayoffsTest({
    drawSize: 16,
    groupSize: 4,
    playoffGroups,
    participantsCount: 14,
    finishingGroupSizes: [4, 4, 4, 2],
  });
});

it('can generate Playoffs for Round Robins when BYEs are present (3)', () => {
  const playoffGroups = [
    {
      finishingPositions: [1],
      structureName: 'Playoff 1',
      positionAssignmentsCount: 4,
      participantIdsCount: 4,
      byesCount: 0,
    },
    {
      finishingPositions: [2],
      structureName: 'Playoff 2',
      positionAssignmentsCount: 4,
      participantIdsCount: 4,
      byesCount: 0,
    },
    {
      finishingPositions: [3],
      structureName: 'Playoff 3',
      positionAssignmentsCount: 4,
      participantIdsCount: 4,
      byesCount: 0,
    },
    {
      finishingPositions: [4],
      structureName: 'Playoff 4',
      positionAssignmentsCount: 4,
      participantIdsCount: 4,
      byesCount: 0,
    },
  ];
  roundRobinWithPlayoffsTest({
    drawSize: 16,
    groupSize: 4,
    playoffGroups,
    participantsCount: 16,
    finishingGroupSizes: [4, 4, 4, 4],
  });
});

it('can generate Playoffs for Round Robins when BYEs are present (4)', () => {
  const playoffGroups = [
    {
      finishingPositions: [1],
      structureName: 'Playoff 1',
      positionAssignmentsCount: 4,
      participantIdsCount: 4,
      byesCount: 0,
    },
    {
      finishingPositions: [2],
      structureName: 'Playoff 2',
      positionAssignmentsCount: 4,
      participantIdsCount: 4,
      byesCount: 0,
    },
    {
      finishingPositions: [3],
      structureName: 'Playoff 3',
      positionAssignmentsCount: 4,
      participantIdsCount: 4,
      byesCount: 0,
    },
    {
      finishingPositions: [4],
      structureName: 'Playoff 4',
      positionAssignmentsCount: 4,
      participantIdsCount: 2,
      byesCount: 2,
    },
  ];
  roundRobinWithPlayoffsTest({
    drawSize: 16,
    groupSize: 4,
    playoffGroups,
    participantsCount: 14,
    finishingGroupSizes: [4, 4, 4, 2],
  });
});

it.skip('can generate Playoffs for Round Robins when BYEs are present (5)', () => {
  const playoffGroups = [
    {
      finishingPositions: [1],
      structureName: 'Playoff 1',
      positionAssignmentsCount: 4,
      participantIdsCount: 4,
      byesCount: 0,
    },
    {
      finishingPositions: [2],
      structureName: 'Playoff 2',
      positionAssignmentsCount: 4,
      participantIdsCount: 4,
      byesCount: 0,
    },
    {
      finishingPositions: [3],
      structureName: 'Playoff 3',
      positionAssignmentsCount: 4,
      participantIdsCount: 4,
      byesCount: 0,
    },
    /*
    // causes intermittent error
    {
      finishingPositions: [4],
      structureName: 'Playoff 4',
      positionAssignmentsCount: 4,
      participantIdsCount: 1,
      byesCount: 3,
    },
    */
  ];

  roundRobinWithPlayoffsTest({
    drawSize: 16,
    groupSize: 4,
    playoffGroups,
    participantsCount: 13,
    finishingGroupSizes: [4, 4, 4, 1],
  });
});

// this test can fail because of avoidance issues.  It is an edge case but warrants further investigation
it.skip('can generate Playoffs for Round Robins when BYEs are present (6)', () => {
  const playoffGroups = [
    {
      finishingPositions: [1],
      structureName: 'Playoff 1',
      positionAssignmentsCount: 4,
      participantIdsCount: 4,
      byesCount: 0,
    },
    {
      finishingPositions: [2],
      structureName: 'Playoff 2',
      positionAssignmentsCount: 4,
      participantIdsCount: 4,
      byesCount: 0,
    },
    {
      finishingPositions: [3, 4],
      structureName: 'Playoff 3',
      positionAssignmentsCount: 8,
      participantIdsCount: 5,
      byesCount: 3,
    },
  ];

  roundRobinWithPlayoffsTest({
    drawSize: 16,
    groupSize: 4,
    playoffGroups,
    participantsCount: 13,
    finishingGroupSizes: [4, 4, 4, 1],
  });
});

it('can generate Playoffs for Round Robins when BYEs are present (7)', () => {
  const playoffGroups = [
    {
      finishingPositions: [1],
      structureName: 'Playoff 1',
      positionAssignmentsCount: 2,
      participantIdsCount: 2,
      byesCount: 0,
    },
    {
      finishingPositions: [2],
      structureName: 'Playoff 2',
      positionAssignmentsCount: 2,
      participantIdsCount: 2,
      byesCount: 0,
    },
    {
      finishingPositions: [3],
      structureName: 'Playoff 3',
      positionAssignmentsCount: 2,
      participantIdsCount: 2,
      byesCount: 0,
    },
    {
      finishingPositions: [4],
      structureName: 'Playoff 4',
      positionAssignmentsCount: 2,
      participantIdsCount: 1,
      byesCount: 1,
    },
  ];

  const { drawDefinition } = roundRobinWithPlayoffsTest({
    drawSize: 8,
    groupSize: 4,
    playoffGroups,
    participantsCount: 7,
    finishingGroupSizes: [2, 2, 2, 1],
  });
  const byeMatchUp = drawDefinition.structures[4].matchUps[0];
  expect(byeMatchUp.finishingPositionRange.winner).toEqual([7, 7]);
});
