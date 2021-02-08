import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../../tournamentEngine/sync';
import {
  getOrderedDrawPositionPairs,
  removeAssignment,
} from '../../testingUtilities';

it('can advance participants when double BYEs are created', () => {
  const drawProfiles = [
    {
      drawSize: 8,
      participantsCount: 6,
    },
  ];
  const { drawIds, tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  tournamentEngine.setState(tournamentRecord);
  const drawId = drawIds[0];

  let {
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId });
  const structureId = structures[0].structureId;

  let { orderedPairs, matchUps } = getOrderedDrawPositionPairs({ structureId });
  let structureMatchUps = matchUps.filter(
    (matchUp) => matchUp.structureId === structureId
  );
  let finalMatchUp = structureMatchUps.find(
    ({ roundNumber, roundPosition }) => roundNumber === 3 && roundPosition === 1
  );
  expect(finalMatchUp.drawPositions).toEqual([undefined, undefined]);
  ({ orderedPairs, matchUps } = getOrderedDrawPositionPairs({ structureId }));
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

  // now remove assignment for { drawPosition: 2 }
  // expect { drawPosition: 1 } to be removed from all advanced positions
  let result = tournamentEngine.removeDrawPositionAssignment({
    drawId,
    drawPosition: 2,
    structureId,
  });
  expect(result.success).toEqual(true);
  ({ orderedPairs } = getOrderedDrawPositionPairs({ structureId }));
  expect(orderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [undefined, 3],
    [8, undefined],
    [undefined, undefined],
  ]);
});
