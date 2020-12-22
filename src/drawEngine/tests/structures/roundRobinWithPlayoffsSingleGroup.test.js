import { roundRobinWithPlayoffsTest } from './roundRobinWithPlayoffsTest';

import { SINGLE_ELIMINATION } from '../../../constants/drawDefinitionConstants';

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
  roundRobinWithPlayoffsTest({
    drawSize: 8,
    groupSize: 5,
    groupsCount: 2,
    playoffGroups,
    participantsCount: 8,
    finishingGroupSizes: [2, 2, 2, 2],
  });
});
