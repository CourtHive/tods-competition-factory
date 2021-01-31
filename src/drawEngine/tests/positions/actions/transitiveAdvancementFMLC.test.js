import mocksEngine from '../../../../mocksEngine';
import { structureAssignedDrawPositions } from '../../../getters/positionsGetter';
import tournamentEngine from '../../../../tournamentEngine';
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

it('can advance participants when double BYEs are created', () => {
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
  const structureId = mainStructure.structureId;

  let { orderedPairs, matchUps } = getOrderedDrawPositionPairs({ structureId });
  let structureMatchUps = matchUps.filter(
    (matchUp) => matchUp.structureId === structureId
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
    structureId,
    drawPosition: 3,
    replaceWithBye: true,
  });
  ({ orderedPairs } = getOrderedDrawPositionPairs({ structureId }));
  expect(orderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [1, 4], // drawPositions 1 and 4 are both BYE-advanced
    [8, undefined], // drawPosition 8 is BYE-advanced
    [undefined, undefined],
  ]);

  removeAssignment({
    drawId,
    structureId,
    drawPosition: 4,
    replaceWithBye: true,
  });

  ({ orderedPairs } = getOrderedDrawPositionPairs({ structureId }));
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
  // console.log({ orderedPairs });
  expect(orderedPairs).toEqual([
    [3, 4], // 3 and 4 are BYEs
    [5, 6], // 6 is a BYE
    [1, 3], // 3 is BYE-advanced
    [2, 5], // 5 is BYE-advanced
    [1, undefined],
  ]);
});
