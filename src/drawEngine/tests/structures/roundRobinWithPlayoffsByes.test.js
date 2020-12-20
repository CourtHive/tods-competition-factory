import { roundRobinWithPlayoffsTest } from './roundRobinWithPlayoffsTest';

import { SINGLE_ELIMINATION } from '../../../constants/drawDefinitionConstants';

it('can generate Playoffs for Round Robins when BYEs are present (1)', () => {
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
