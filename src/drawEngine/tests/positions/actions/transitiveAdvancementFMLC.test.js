import { structureAssignedDrawPositions } from '../../../getters/positionsGetter';
import tournamentEngine from '../../../../tournamentEngine/sync';
import mocksEngine from '../../../../mocksEngine';
import {
  getOrderedDrawPositionPairs,
  removeAssignment,
} from '../../testingUtilities';

import { FIRST_MATCH_LOSER_CONSOLATION } from '../../../../constants/drawDefinitionConstants';

it('can generate FMLC and properly place BYEs in consolation structure', () => {
  const drawProfiles = [
    {
      drawSize: 8,
      participantsCount: 6,
      drawType: FIRST_MATCH_LOSER_CONSOLATION,
    },
  ];
  const { drawIds, tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  tournamentEngine.setState(tournamentRecord);
  const drawId = drawIds[0];

  let {
    drawDefinition: {
      structures: [mainStructure, consolationStructure],
    },
  } = tournamentEngine.getEvent({ drawId });

  const mainStructureAssignments = structureAssignedDrawPositions({
    structure: mainStructure,
  });
  expect(mainStructureAssignments.byePositions.length).toEqual(2);
  const consolationStructureAssignments = structureAssignedDrawPositions({
    structure: consolationStructure,
  });
  expect(consolationStructureAssignments.byePositions.length).toEqual(2);
});

it('can advance participants when double BYEs are created removing 3-4', () => {
  const drawProfiles = [
    {
      drawSize: 8,
      participantsCount: 6,
      drawType: FIRST_MATCH_LOSER_CONSOLATION,
    },
  ];
  const { drawIds, tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  tournamentEngine.setState(tournamentRecord);
  const drawId = drawIds[0];

  let {
    drawDefinition: {
      structures: [mainStructure, consolationStructure],
    },
  } = tournamentEngine.getEvent({ drawId });

  let { orderedPairs, matchUps } = getOrderedDrawPositionPairs({
    structureId: mainStructure.structureId,
  });
  let structureMatchUps = matchUps.filter(
    (matchUp) => matchUp.structureId === mainStructure.structureId
  );
  let finalMatchUp = structureMatchUps.find(
    ({ roundNumber, roundPosition }) => roundNumber === 2 && roundPosition === 1
  );
  expect(finalMatchUp.drawPositions.filter(Boolean)).toEqual([1]);
  expect(orderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [1, undefined], // drawPosition 1 is BYE-advanced
    [8, undefined], // drawPosition 8 is BYE-advanced
    [undefined, undefined],
  ]);

  removeAssignment({
    drawId,
    structureId: mainStructure.structureId,
    drawPosition: 3,
    replaceWithBye: true,
  });
  ({ orderedPairs } = getOrderedDrawPositionPairs({
    structureId: mainStructure.structureId,
  }));
  expect(orderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [1, 4], // drawPositions 1 and 4 are both BYE-advanced
    [8, undefined], // drawPosition 8 is BYE-advanced
    [undefined, undefined],
  ]);

  ({
    drawDefinition: {
      structures: [mainStructure, consolationStructure],
    },
  } = tournamentEngine.getEvent({ drawId }));
  /*
  let consolationStructureAssignments = structureAssignedDrawPositions({
    structure: consolationStructure,
  });
  */
  removeAssignment({
    drawId,
    structureId: mainStructure.structureId,
    drawPosition: 4,
    replaceWithBye: true,
  });

  ({ orderedPairs } = getOrderedDrawPositionPairs({
    structureId: mainStructure.structureId,
  }));
  expect(orderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [1, 3],
    [8, undefined],
    [1, undefined], // drawPosition 4 is now a BYE, advancing 1
  ]);

  // now check the consolation structure
  ({ orderedPairs } = getOrderedDrawPositionPairs({
    structureId: consolationStructure.structureId,
  }));
  ({
    drawDefinition: {
      structures: [mainStructure, consolationStructure],
    },
  } = tournamentEngine.getEvent({ drawId }));
  expect(orderedPairs).toEqual([
    [3, 4], // 3 and 4 are BYEs
    [5, 6], // 6 is a BYE
    [1, 3], // 3 is BYE-advanced, 1 is BYE
    [2, 5], // 5 is BYE-advanced
    [3, undefined], // 3 is BYE advanced by 1 which is a BYE
  ]);
  const consolationStructureAssignments = structureAssignedDrawPositions({
    structure: consolationStructure,
  });
  const byePositions = consolationStructureAssignments.byePositions.map(
    ({ drawPosition }) => drawPosition
  );
  expect(byePositions).toEqual([1, 3, 4, 6]);
});

it('can advance participants when double BYEs are created removing 5-6', () => {
  const drawProfiles = [
    {
      drawSize: 8,
      participantsCount: 6,
      drawType: FIRST_MATCH_LOSER_CONSOLATION,
    },
  ];
  const { drawIds, tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  tournamentEngine.setState(tournamentRecord);
  const drawId = drawIds[0];

  let {
    drawDefinition: {
      structures: [mainStructure, consolationStructure],
    },
  } = tournamentEngine.getEvent({ drawId });

  let { orderedPairs, matchUps } = getOrderedDrawPositionPairs({
    structureId: mainStructure.structureId,
  });
  let structureMatchUps = matchUps.filter(
    (matchUp) => matchUp.structureId === mainStructure.structureId
  );
  let finalMatchUp = structureMatchUps.find(
    ({ roundNumber, roundPosition }) => roundNumber === 2 && roundPosition === 1
  );
  expect(finalMatchUp.drawPositions).toEqual([1, undefined]);
  expect(orderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [1, undefined], // drawPosition 1 is BYE-advanced
    [8, undefined], // drawPosition 8 is BYE-advanced
    [undefined, undefined],
  ]);

  removeAssignment({
    drawId,
    structureId: mainStructure.structureId,
    drawPosition: 5,
    replaceWithBye: true,
  });
  ({ orderedPairs } = getOrderedDrawPositionPairs({
    structureId: mainStructure.structureId,
  }));
  expect(orderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [1, undefined], // drawPosition 1 is BYE-advanced
    [6, 8], // drawPositions 6, 8 are BYE-advanced
    [undefined, undefined],
  ]);

  ({
    drawDefinition: {
      structures: [mainStructure, consolationStructure],
    },
  } = tournamentEngine.getEvent({ drawId }));

  tournamentEngine.devContext(true);
  removeAssignment({
    drawId,
    structureId: mainStructure.structureId,
    drawPosition: 6,
    replaceWithBye: true,
  });

  ({ orderedPairs } = getOrderedDrawPositionPairs({
    structureId: mainStructure.structureId,
  }));
  expect(orderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [1, undefined],
    [5, 8],
    [8, undefined], // drawPosition 5 is now a BYE, advancing 8
  ]);

  // now check the consolation structure
  ({ orderedPairs } = getOrderedDrawPositionPairs({
    structureId: consolationStructure.structureId,
  }));
  ({
    drawDefinition: {
      structures: [mainStructure, consolationStructure],
    },
  } = tournamentEngine.getEvent({ drawId }));
  expect(orderedPairs).toEqual([
    [3, 4], // 3 is a BYE; 4 is unassigned
    [5, 6], // 5, 6 are BYEs
    [1, 4], // 4 is BYE-advanced; 1 is unassigned
    [2, 6], // 2 is a BYE; 6 is BYE-advanced
    [6, undefined], // 6 is BYE advanced by 2 which is a BYE
  ]);
  const consolationStructureAssignments = structureAssignedDrawPositions({
    structure: consolationStructure,
  });
  const byePositions = consolationStructureAssignments.byePositions.map(
    ({ drawPosition }) => drawPosition
  );
  expect(byePositions).toEqual([2, 3, 5, 6]);
});

it('does not remove CONSOLATION BYE if at least one source position is a BYE', () => {
  const drawProfiles = [
    {
      drawSize: 8,
      participantsCount: 6,
      drawType: FIRST_MATCH_LOSER_CONSOLATION,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  tournamentEngine.setState(tournamentRecord);

  let {
    drawDefinition: {
      structures: [mainStructure, consolationStructure],
    },
  } = tournamentEngine.getEvent({ drawId });

  let { orderedPairs, matchUps } = getOrderedDrawPositionPairs({
    structureId: mainStructure.structureId,
  });
  let structureMatchUps = matchUps.filter(
    (matchUp) => matchUp.structureId === mainStructure.structureId
  );
  let finalMatchUp = structureMatchUps.find(
    ({ roundNumber, roundPosition }) => roundNumber === 3 && roundPosition === 1
  );
  expect(finalMatchUp.drawPositions.filter(Boolean)).toEqual([]);
  expect(orderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [1, undefined], // drawPosition 1 is BYE-advanced
    [8, undefined], // drawPosition 8 is BYE-advanced
    [undefined, undefined],
  ]);

  removeAssignment({
    drawId,
    structureId: mainStructure.structureId,
    drawPosition: 3,
    replaceWithBye: true,
  });
  ({ orderedPairs } = getOrderedDrawPositionPairs({
    structureId: mainStructure.structureId,
  }));
  expect(orderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [1, 4], // drawPositions 1 and 4 are both BYE-advanced
    [8, undefined], // drawPosition 8 is BYE-advanced
    [undefined, undefined],
  ]);

  // now check the consolation structure
  ({ orderedPairs } = getOrderedDrawPositionPairs({
    structureId: consolationStructure.structureId,
  }));
  expect(orderedPairs).toEqual([
    [3, 4],
    [5, 6],
    [1, 3],
    [2, 5],
    [1, undefined],
  ]);

  tournamentEngine.devContext(true);
  removeAssignment({
    drawId,
    structureId: mainStructure.structureId,
    drawPosition: 4,
  });

  ({ orderedPairs } = getOrderedDrawPositionPairs({
    structureId: mainStructure.structureId,
  }));
  expect(orderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [1, undefined],
    [8, undefined],
    [undefined, undefined], // drawPosition 4 is now a BYE, advancing 1
  ]);

  ({ orderedPairs } = getOrderedDrawPositionPairs({
    structureId: consolationStructure.structureId,
  }));
  // removing { drawPosition: 4 } from mainStructure
  // but NOT replacing it with a BYE does NOT advance any position to the final
  expect(orderedPairs).toEqual([
    [3, 4],
    [5, 6],
    [1, 3],
    [2, 5],
    [undefined, undefined],
  ]);
});
