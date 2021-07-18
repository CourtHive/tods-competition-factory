import drawEngine from '../../sync';

import { reset, initialize, mainDrawPositions } from '../primitives/primitives';

import {
  ITEM,
  CONTAINER,
  WIN_RATIO,
  ROUND_ROBIN,
} from '../../../constants/drawDefinitionConstants';

it('can generate Round Robin Main Draws', () => {
  reset();
  initialize();
  const drawType = ROUND_ROBIN;
  mainDrawPositions({ drawSize: 16 });
  let { structure } = drawEngine.generateDrawType({ drawType });
  expect(structure.structureType).toEqual(CONTAINER);
  expect(structure.finishingPosition).toEqual(WIN_RATIO);
  expect(structure.structures.length).toEqual(4);
  expect(structure.structures[0].structureType).toEqual(ITEM);
  expect(structure.structures[0].matchUps.length).toEqual(6);

  reset();
  initialize();
  mainDrawPositions({ drawSize: 32 });
  ({ structure } = drawEngine.generateDrawType({ drawType }));
  expect(structure.structures.length).toEqual(8);
});

it('can generate Round Robins with varying group sizes', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 30 });
  let structureOptions = { groupSize: 5 };
  let { structure } = drawEngine.generateDrawType({
    drawType: ROUND_ROBIN,
    structureOptions,
  });
  expect(structure.structures.length).toEqual(6);
  expect(structure.structures[0].matchUps.length).toEqual(10);

  reset();
  initialize();
  mainDrawPositions({ drawSize: 30 });
  structureOptions = { groupSize: 3 };
  ({ structure } = drawEngine.generateDrawType({
    drawType: ROUND_ROBIN,
    structureOptions,
  }));
  expect(structure.structures.length).toEqual(10);
  expect(structure.structures[0].matchUps.length).toEqual(3);
  expect(structure.structures[0].matchUps[0].roundNumber).toEqual(1);
  expect(structure.structures[0].matchUps[1].roundNumber).toEqual(2);
  expect(structure.structures[0].matchUps[0].drawPositions).toMatchObject([
    1, 2,
  ]);
  expect(structure.structures[0].matchUps[1].drawPositions).toMatchObject([
    1, 3,
  ]);
  expect(structure.structures[0].matchUps[2].drawPositions).toMatchObject([
    2, 3,
  ]);
});
