import { roundRobinWithPlayoffsTest } from './roundRobinWithPlayoffsTest';
import { it } from 'vitest';

import { SINGLE_ELIMINATION } from '../../../../constants/drawDefinitionConstants';

it('can generate Playoffs for Round Robin with 2 groups of 5, each with BYE', () => {
  const playoffGroups = [
    {
      finishingPositions: [1],
      structureName: 'Gold Flight',
      drawType: SINGLE_ELIMINATION,
      positionAssignmentsCount: 2,
      participantIdsCount: 2,
      byesCount: 0,
    },
    {
      finishingPositions: [2],
      structureName: 'Silver Flight',
      drawType: SINGLE_ELIMINATION,
      positionAssignmentsCount: 2,
      participantIdsCount: 2,
      byesCount: 0,
    },
  ];

  // NOTE: with drawSize: 8 this will throw an error
  // drawSize: 9 allows getValidGroupSizes to ignore participantCount limitations
  roundRobinWithPlayoffsTest({
    finishingGroupSizes: [2, 2, 2, 2],
    participantsCount: 8,
    groupsCount: 2,
    playoffGroups,
    groupSize: 5,
    drawSize: 9,
  });
});
